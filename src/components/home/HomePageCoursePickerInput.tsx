import type { ChangeEvent, RefObject } from "react";

type HomePageCoursePickerInputProps = {
  inputRef: RefObject<HTMLInputElement | null>;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void | Promise<void>;
};

export default function HomePageCoursePickerInput({
  inputRef,
  onChange,
}: HomePageCoursePickerInputProps) {
  return (
    <input
      ref={inputRef}
      type="file"
      multiple
      // @ts-expect-error webkitdirectory is supported in the browser
      webkitdirectory=""
      className="hidden"
      onChange={onChange}
    />
  );
}
