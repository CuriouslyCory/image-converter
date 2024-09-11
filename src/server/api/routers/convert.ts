import { z } from "zod";
import sharp from "sharp";
import imageToIco from "image-to-ico";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { ratelimit } from "~/server/utils/rate-limit";
import { TRPCError } from "@trpc/server";

export const convertRouter = createTRPCRouter({
  convertImage: publicProcedure
    .input(
      z.object({
        image: z.string(),
        format: z.enum(["webp", "ico", "png", "jpeg"]),
        quality: z.number().min(1).max(100).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Rate limiting
      const ip =
        ctx.headers.get("x-forwarded-for") ??
        ctx.headers.get("x-real-ip") ??
        "unknown";
      const { success, remaining } = await ratelimit.limit(ip);
      if (!success) {
        throw new TRPCError({
          message: "Rate limit exceeded",
          code: "TOO_MANY_REQUESTS",
        });
      }

      // Convert the image
      const buffer = Buffer.from(input.image.split(",")[1]!, "base64");
      let result: Buffer | string;

      switch (input.format) {
        case "webp":
          result = await sharp(buffer)
            .webp({ quality: input.quality ?? 80 })
            .toBuffer();
          return `data:image/webp;base64,${result.toString("base64")}`;
        case "ico":
          // convert to a format that image-to-ico can understand
          const jpeg = await sharp(buffer)
            .jpeg({ quality: input.quality ?? 100 })
            .toBuffer();

          result = await imageToIco(jpeg, {
            size: [64, 64],
            quality: 100,
            greyscale: false,
          });
          return `data:image/x-icon;base64,${result.toString("base64")}`;
        case "png":
          result = await sharp(buffer)
            .png({ quality: input.quality ?? 80 })
            .toBuffer();
          return `data:image/png;base64,${result.toString("base64")}`;
        case "jpeg":
          result = await sharp(buffer)
            .jpeg({ quality: input.quality ?? 80 })
            .toBuffer();
          return `data:image/jpeg;base64,${result.toString("base64")}`;
        default:
          throw new Error("Unsupported format");
      }
    }),
});
