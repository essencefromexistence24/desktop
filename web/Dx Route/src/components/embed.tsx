import { cn } from "@/lib/utils";

export function YouTubeEmbed({
  videoId,
  title,
}: {
  videoId: string;
  title: string;
}) {
  return (
    <div className="relative my-[1.25em]">
      <iframe
        className="aspect-video w-full rounded-xl"
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />

      <div className="pointer-events-none absolute inset-0 rounded-xl inset-ring-1 inset-ring-black/10 dark:inset-ring-white/10" />
    </div>
  );
}

export function IframeEmbed({ className, ...props }: React.ComponentProps<"iframe">) {
  return (
    <div className="relative my-[1.25em]">
      <iframe className={cn("aspect-video w-full rounded-xl", className)} {...props} />

      <div className="pointer-events-none absolute inset-0 rounded-xl inset-ring-1 inset-ring-black/10 dark:inset-ring-white/10" />
    </div>
  );
}

export function FramedImage({ ...props }: React.ComponentProps<"img">) {
  // eslint-disable-next-line jsx-a11y/alt-text
  const image = <img {...props} />;

  return (
    <figure className="relative [&_img]:rounded-xl">
      {image}

      <div className="pointer-events-none absolute inset-0 rounded-xl inset-ring-1 inset-ring-black/10 dark:inset-ring-white/10" />
    </figure>
  );
}
