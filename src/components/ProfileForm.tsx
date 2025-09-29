"use client";

import { useEffect, useState } from "react";
import z from "zod";
import { api } from "~/trpc/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { redirect } from "next/navigation";

const Courses = ["BCA", "BBA-IT", "MBA-IT", "MSc-CA"];
const Years = ["1", "2", "3"];
const Divisions = ["A", "B", "C", "D"];

const fileSchema = z
  .custom<File>((val) => val instanceof File, {
    message: "Must be a valid file",
  })
  .refine(
    (file) => file?.size <= 5_000_000, // 5MB limit
    "File size must be less than 5MB",
  )
  .refine(
    (file) => file?.type.startsWith("image/"),
    "Only image files are allowed",
  )
  .optional()
  .nullable();

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  image: fileSchema,
  prn: z
    .string()
    .min(11, "PRN must be at 11 characters long")
    .max(11, "PRN must be at 11 characters long"),
  course: z.string().min(2, "Course must be selected"),
  year: z.coerce.number().min(1, "Year must be selected"),
  division: z.string().min(1, "Division must be selected"),
});

function ProfileForm() {
  const user = api.user.getCurrentUser.useQuery();
  const utils = api.useUtils();
  const updateUser = api.user.update.useMutation({
    onSuccess: async () => {
      await utils.user.getCurrentUser.invalidate();
      toast.success("Profile updated successfully");
      redirect("/dashboard");
    },
    onError: (error) => toast.error(error.message),
  });
  const [isValidating, setIsValidating] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.data?.name ?? "",
      email: user.data?.email ?? "",
      prn: user.data?.prn ?? "",
      image: null,
    },
  });

  useEffect(() => {
    form.setValue("name", user.data?.name ?? "");
    form.setValue("email", user.data?.email ?? "");
    form.setValue("prn", user.data?.prn ?? "");
    form.setValue("course", user.data?.course ?? "");
    form.setValue("year", user.data?.year ?? 1);
    form.setValue("division", user.data?.division ?? "");
  }, [user.data, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.image) {
      const reader = new FileReader();
      reader.readAsDataURL(values.image);
      reader.onloadend = async () => {
        const base64Data =
          typeof reader.result === "string" ? reader.result.split(",")[1] : "";
        if (base64Data) {
          await updateUser.mutateAsync({
            name: values.name,
            email: values.email,
            prn: values.prn,
            course: values.course,
            year: values.year,
            division: values.division,
            image: base64Data,
            fileName: values.image!.name,
            fileType: values.image!.type,
          });
        }
      };
    } else {
      await updateUser.mutateAsync({
        name: values.name,
        email: values.email,
        prn: values.prn,
        course: values.course,
        year: values.year,
        division: values.division,
      });
    }
  }

  return (
    <div className="flex w-full px-4">
      {user.isLoading ? (
        <Loader2 className="m-auto h-8 w-8 animate-spin text-neutral-800" />
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-full flex-col items-center gap-4 text-neutral-800"
          >
            <div className="relative h-[125px] w-[125px] overflow-hidden rounded-full border border-[#6a7077]">
              <Image
                src={preview ?? user.data?.image ?? "/avatar.png"}
                alt="Avatar"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div
                className={`${isValidating ? "absolute" : "hidden"} flex h-full w-full items-center justify-center text-white`}
              >
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              </div>
            </div>
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem className="mb-[15px] w-full text-left">
                  <FormLabel className="text-left text-base font-bold">
                    Profile Picture
                  </FormLabel>
                  <FormControl>
                    <Input
                      accept="image/*"
                      type="file"
                      onChange={async (event) => {
                        setIsValidating(true);
                        const file = event.target.files?.[0] ?? null;
                        field.onChange(file);
                        form.setValue("image", file);
                        await form.trigger("image");
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () =>
                            setPreview(reader.result as string);
                          reader.readAsDataURL(file);
                        } else {
                          setPreview(null);
                        }
                        setIsValidating(false);
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      className="border-primary w-full rounded-md border px-[15px]"
                    />
                  </FormControl>
                  <p className="text-sm text-[#6a7077] italic">
                    Acceptable formats. jpg, png only Max file size is 5MB
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Full Name"
                      disabled={true}
                      className="border-primary"
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Email"
                      disabled={true}
                      className="border-primary"
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="prn"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>PRN</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="PRN"
                      className="border-primary"
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="course"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Course</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl className="border-primary w-full">
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Courses.map((course) => (
                        <SelectItem key={course} value={course}>
                          {course}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Year</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={""}>
                    <FormControl className="border-primary w-full">
                      <SelectTrigger>
                        <SelectValue placeholder="Select a year" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Years.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="division"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Division</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl className="border-primary w-full">
                      <SelectTrigger>
                        <SelectValue placeholder="Select a division" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Divisions.map((division) => (
                        <SelectItem key={division} value={division}>
                          {division}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="h-[46px] w-full max-w-[375px] cursor-pointer"
              loading={updateUser.isPending}
            >
              Save
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}

export default ProfileForm;
