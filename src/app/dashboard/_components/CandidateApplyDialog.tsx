"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";

const allowedFileTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
];

type AllowedFileTypes =
  | "application/pdf"
  | "image/jpeg"
  | "image/png"
  | "image/jpg";

const formSchema = z.object({
  image: z
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
    .nullable(),

  manifesto: z
    .custom<File>((val) => val instanceof File, {
      message: "Must be a valid file",
    })
    .refine(
      (file) => file?.size <= 10_000_000, // 10MB limit
      "File size must be less than 10MB",
    )
    .refine(
      (file) => allowedFileTypes.includes(file.type),
      "Only PDF and image files are allowed",
    ),
});

const readFileAsBase64 = (file: File) =>
  new Promise<{
    file: string;
    fileName: string;
    fileType: AllowedFileTypes;
  }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const data =
        typeof reader.result === "string"
          ? (reader.result.split(",")[1] ?? "")
          : "";
      resolve({
        file: data,
        fileName: file.name,
        fileType: file.type as AllowedFileTypes,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

function CandidateApplyDialog() {
  const user = api.user.getCurrentUser.useQuery();
  const utils = api.useUtils();
  const appyCandidate = api.candidate.createApplication.useMutation({
    onSuccess: async () => {
      await utils.user.getCurrentUser.invalidate();
      await utils.candidate.isCandidate.invalidate();
      toast.success("Candidature Applied Successfully");
      form.reset();
      setPreview({
        image: null,
        manifesto: null,
      });
      setIsValidating({
        image: false,
        manifesto: false,
      });
    },
    onError: (err) => toast.error(err.message),
  });
  const [isValidating, setIsValidating] = useState({
    image: false,
    manifesto: false,
  });
  const [preview, setPreview] = useState<{
    image: string | null;
    manifesto: string | null;
  }>({
    image: null,
    manifesto: null,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      image: null,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.image) {
      const [imageFileResult, manifestoFileResult] = await Promise.all(
        [values.image, values.manifesto].map(readFileAsBase64),
      );

      await appyCandidate.mutateAsync({
        image: imageFileResult,
        manifesto: manifestoFileResult!,
      });
    }

    const manifestoFileResult = await readFileAsBase64(values.manifesto);

    await appyCandidate.mutateAsync({
      manifesto: manifestoFileResult,
    });
  }

  return (
    <Dialog>
      <Form {...form}>
        <form>
          <DialogTrigger asChild>
            <Button>Apply Now</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            {user.isLoading ? (
              <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="m-auto h-8 w-8 animate-spin text-neutral-800" />
              </div>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Apply for Candidature</DialogTitle>
                  <DialogDescription>
                    Fill in your details to apply for the candidature. We will
                    get back to you soon.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="relative m-auto h-[100px] w-[100px] overflow-hidden rounded-full border border-[#6a7077]">
                    <Image
                      src={preview.image ?? user.data?.image ?? "/avatar.png"}
                      alt="Avatar"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div
                      className={`${isValidating.image ? "absolute" : "hidden"} flex h-full w-full items-center justify-center text-white`}
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
                              setIsValidating((prev) => ({
                                ...prev,
                                image: true,
                              }));
                              const file = event.target.files?.[0] ?? null;
                              field.onChange(file);
                              form.setValue("image", file);
                              await form.trigger("image");
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = () =>
                                  setPreview((prev) => ({
                                    ...prev,
                                    image: reader.result as string,
                                  }));
                                reader.readAsDataURL(file);
                              } else {
                                setPreview((prev) => ({
                                  ...prev,
                                  image: null,
                                }));
                              }
                              setIsValidating((prev) => ({
                                ...prev,
                                image: false,
                              }));
                            }}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                            className="border-primary w-full rounded-md border px-[15px]"
                          />
                        </FormControl>
                        <p className="text-sm text-[#6a7077] italic">
                          Acceptable formats. jpg, png only Max file size is 5MB
                          <br />
                          <span className="font-bold text-[#6a7077] italic">
                            (Optional) - If your current profile picture is not
                            your formal picture, please upload a new one.
                          </span>
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="manifesto"
                    render={({ field }) => (
                      <FormItem className="mb-[15px] w-full text-left">
                        <FormLabel className="text-left text-base font-bold">
                          Manifesto
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            onChange={async (event) => {
                              setIsValidating((prev) => ({
                                ...prev,
                                manifesto: true,
                              }));
                              const file = event.target.files?.[0] ?? null;
                              field.onChange(file);
                              form.setValue("manifesto", file!);
                              await form.trigger("manifesto");
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = () =>
                                  setPreview((prev) => ({
                                    ...prev,
                                    manifesto: reader.result as string,
                                  }));
                                reader.readAsDataURL(file);
                              } else {
                                setPreview((prev) => ({
                                  ...prev,
                                  manifesto: null,
                                }));
                              }
                              setIsValidating((prev) => ({
                                ...prev,
                                manifesto: false,
                              }));
                            }}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                            className="border-primary w-full rounded-md border px-[15px]"
                          />
                        </FormControl>
                        <p className="text-sm text-[#6a7077] italic">
                          Acceptable formats. jpg, png, pdf only Max file size
                          is 10MB
                          <br />
                          <span className="font-bold text-[#6a7077] italic">
                            (Required) - Please upload your manifesto in PDF or
                            image format. This will be shared with the voters if
                            you are shortlisted.
                          </span>
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {preview.manifesto && (
                    <Link href={preview.manifesto} target="_blank">
                      <div className="border-primary text-primary rounded-md border px-3 py-1.5 text-sm font-medium hover:underline">
                        View Manifesto
                      </div>
                    </Link>
                  )}
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    loading={appyCandidate.isPending}
                    onClick={form.handleSubmit(onSubmit)}
                  >
                    Submit Application
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </form>
      </Form>
    </Dialog>
  );
}

export default CandidateApplyDialog;
