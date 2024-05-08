/**
* This code was generated by v0 by Vercel.
* @see https://v0.dev/t/VrAJR4OUlXV
* Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
*/

/** Add fonts into your Next.js project:

import { Inter } from 'next/font/google'

inter({
  subsets: ['latin'],
  display: 'swap',
})

To read more about using these font, please visit the Next.js documentation:
- App Directory: https://nextjs.org/docs/app/building-your-application/optimizing/fonts
- Pages Directory: https://nextjs.org/docs/pages/building-your-application/optimizing/fonts
**/
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CardContent, Card } from "@/components/ui/card"
import { ChangeEvent } from "react"

export function UploadImage({onSubmit}: {onSubmit(image: HTMLImageElement): void }) {
  const onChangeImage = (event: ChangeEvent<HTMLInputElement>) => {
    const files = (event.target as HTMLInputElement).files;
    if (files) {
      const src = URL.createObjectURL(files[0]);
      const image = new Image();
      image.src = src;
      onSubmit(image);
    }
  }
  return (
    <div className="grid gap-4 max-w-md mx-auto">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">Upload an Image</h2>
        <p className="text-gray-500 dark:text-gray-400">Drag and drop your image or click to select a file.</p>
      </div>
      <Card>
        <CardContent className="grid gap-4 p-4">
          <div className="group relative flex h-40 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-gray-400 dark:border-gray-700 dark:bg-gray-800">
            <div className="pointer-events-none z-10 flex flex-col items-center space-y-2 text-sm text-gray-500 transition-colors group-hover:text-gray-600 dark:text-gray-400 dark:group-hover:text-gray-300">
              <UploadIcon />
              <p>Drag and drop your image here</p>
            </div>
            <input onChange={onChangeImage} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" type="file" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function UploadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  )
}