import {Image as HydrogenImage} from "@shopify/hydrogen";
import type {Image as ImageType} from "@shopify/hydrogen/storefront-api-types";
import type React from "react";
import {forwardRef, useEffect, useRef, useState} from "react";
import {cn} from "~/utils/cn";

// Keep crop type aligned with Hydrogen Image props
// https://shopify.dev/docs/api/hydrogen/components/image

type Crop = "center" | "top" | "bottom" | "left" | "right";

export interface ImageProps extends React.ComponentPropsWithRef<"img"> {
  aspectRatio?: string;
  crop?: Crop;
  data?: Partial<
    ImageType & {
      recurseIntoArrays: true;
    }
  >;
  loader?: (params: {
    src?: ImageType["url"];
    width?: number;
    height?: number;
    crop?: Crop;
  }) => string;
  srcSetOptions?: {
    intervals: number;
    startingWidth: number;
    incrementSize: number;
    placeholderWidth: number;
  };
  containerClassName?: string;
}

export const Image = forwardRef<HTMLDivElement, ImageProps>(
  ({className, onLoad, containerClassName, ...rest}, ref) => {
    // Use a ref to the underlying Hydrogen <img /> element
    const hydrogenImageRef = useRef<HTMLImageElement>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
      if (hydrogenImageRef.current?.complete) {
        setLoaded(true);
        // @ts-expect-error - align with HTMLImageElement onLoad signature
        onLoad?.();
      }
    }, [onLoad]);

    return (
      <div
        ref={ref}
        className={cn(
          "h-full w-full overflow-hidden",
          containerClassName
        )}
      >
        <HydrogenImage
          ref={hydrogenImageRef}
          className={cn(
            "[transition:opacity_300ms_ease]",
            "h-full max-h-full w-full object-cover object-center",
            loaded ? "opacity-100" : "opacity-90",
            className
          )}
          onLoad={(e) => {
            setLoaded(true);
            onLoad?.(e);
          }}
          {...rest}
        />
      </div>
    );
  }
);
