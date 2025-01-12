"use client";

import {
  Content_Guide_Storage_Key,
  Default_Debounce_Duration,
  defaultEditorGuideContent,
} from "@/lib/consts";
import NewPostButton from "@/ui/new-post-button";
import { Editor as InkeEditor } from "inke";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LoadingCircle } from "@/ui/shared/icons";
import { Session } from "next-auth";

export function Welcome() {
  return (
    <div className="grids mt-3 flex w-full max-w-[88%] flex-col items-center justify-center py-6">
      <p className="title-font animate-fade-up font-display mb-6 text-center text-3xl font-bold tracking-[-0.02em] text-slate-700 drop-shadow-sm md:mb-8 md:text-5xl">
        <span className="bg-gradient-to-r from-slate-400 via-slate-500 to-slate-800 bg-clip-text text-transparent ">
          Simple
        </span>
        , AI Powered,{" "}
        <span className="bg-gradient-to-r from-slate-800 via-slate-500 to-slate-400 bg-clip-text text-transparent ">
          Markdown
        </span>
      </p>

      <NewPostButton
        className="h-10 w-36 py-2 font-medium shadow-md md:h-12 md:w-44 md:px-3 md:text-lg"
        text="Start writing now"
      />
    </div>
  );
}

export function EditorGuide({ session }: { session: Session | null }) {
  const [canRenderGuide, setCanRenderGuide] = useState(false);
  const [isShowLocalHunt, setShowLocalHunt] = useState(false);

  useEffect(() => {
    if (window) {
      localStorage.removeItem(Content_Guide_Storage_Key);
      setCanRenderGuide(true);
    }
  }, []);

  const imageLoader = ({ src, width }) => {
    return `${src}?w=${width}`;
  };

  return (
    <>
      <Image
        className="my-6 w-[85%] rounded-lg shadow-lg transition-all hover:opacity-90 hover:shadow-xl"
        alt={"example"}
        src={"/desktop.png"}
        width={960}
        height={550}
      />
      <Link
        className="mb-2 mt-4"
        href="https://www.producthunt.com/posts/inke?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-inke"
        target="_blank"
      >
        {isShowLocalHunt ? (
          <Image
            src="/product.svg"
            alt="Product Hunt"
            width={250}
            height={54}
          />
        ) : (
          <Image
            loader={imageLoader}
            src="https://api.producthunt.com/widgets/embed-image/v1/featured.png?post_id=419235&theme=light"
            alt="Product Hunt"
            width={250}
            height={54}
            onError={(e) => {
              if (e) {
                setShowLocalHunt(true);
              }
            }}
          />
        )}
      </Link>

      {canRenderGuide ? (
        <InkeEditor
          className="relative -mt-2 mb-3 w-full max-w-screen-lg overflow-y-auto border-stone-200 bg-white"
          storageKey={Content_Guide_Storage_Key}
          debounceDuration={Default_Debounce_Duration}
          defaultValue={defaultEditorGuideContent}
        />
      ) : (
        <LoadingCircle className="my-10 h-6 w-6" />
      )}

      <NewPostButton
        className="mb-3 h-10 w-36 py-2 font-medium shadow-md md:h-12 md:w-44 md:px-3 md:text-lg"
        text="Start writing now"
      />
    </>
  );
}
