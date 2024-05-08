import { UploadImage } from "@/components/component/upload-image";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle"

import { useDraw } from "@/hooks/useDraw";
import { Modes } from "@/types/enums";
import { IconButton, Input } from "@chakra-ui/react";
import { ChangeEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTemplates } from "./ducks/slice";
import { RootState } from "@/redux/store";
import { CirclePicker } from 'react-color';

export function DrawComponent() {
    const [isFetching, setIsFetching] = useState(false);
    const dispatch = useDispatch()
    const templates = useSelector((root: RootState) => root.template.templates);
    const [templateToEdit, setTemplateToEdit] = useState<Templates | null>(null);
    const getTemplates = async () => {
        try {
            setIsFetching(true);
            const resonse = await fetch(`${process.env.NEXt_API_BASE_URL}/template`)
            const data: Templates[] = await resonse.json();
            dispatch(setTemplates(data));
        } catch(error){
            console.log("Error", error)
        } finally {
            setIsFetching(false);
        }
    };

    const onDeleteTemplate = async (template: Templates) => {
        try {
            const resonse = await fetch(`${process.env.NEXt_API_BASE_URL}/template/${template.id}`, {
                method: "delete"
            })
            if(resonse.status === 204) {
                getTemplates();
            }
        } catch(error){
            console.log("Error", error)
        }
    }

    useEffect(() => {
        getTemplates();
    },[])

return (
<div className="flex h-screen w-full">
    <div className="hidden w-64 border-r bg-gray-100 dark:border-gray-800 dark:bg-gray-900 lg:block">
        <div className="flex h-full flex-col gap-4 p-4">
            <div className="flex items-center gap-2">
                <BrushIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-50">Drawing Templates</h2>
            </div>
            <div className="flex-1 overflow-auto">
                <ul className="space-y-2">
                    {
                        templates.map((template) => (
                    <li
                        className="rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => setTemplateToEdit(template)}
                        >
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <ShapesIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                <span>{template.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                                    size="icon" variant="ghost"
                                    onClick={() => onDeleteTemplate(template)}>
                                    <TrashIcon className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="mt-2 space-y-2">
                        {
                            template.shapes.map((shape, index) => (
                                <div
                                    className="flex items-center justify-between rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-700">
                                    <div className="flex items-center gap-2">
                                        <SquareIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        <span>Rectangle {index + 1}</span>
                                    </div>
                                </div>
                            ))
                        }
                        </div>
                    </li>
                    ))
                    }
                </ul>
            </div>
        </div>
    </div>
    <div className="flex-1">
        <div className="flex h-full flex-col">
            <div
                className="flex h-14 items-center justify-between border-b bg-gray-100 px-4 dark:border-gray-800 dark:bg-gray-900">
            </div>
            <DrawPage templateToEdit={templateToEdit} refreshData={getTemplates} />
        </div>
    </div>
</div>
)
}

function DrawPage({ templateToEdit, refreshData }: {templateToEdit: Templates | null; refreshData(): void}) {
  const { canvasRef, overlayRef, mode, onModeChange, onSubmitImage, onClickDownloadAsImage, rectangleList, onClickEditTemplate, color, onColorChange } = useDraw();
  const [templateTitle, setTemplateTitle] = useState(!templateToEdit ? "New Template" : templateToEdit?.name);
  const onClickModeOptions = (mode: Modes) => {
    return () => {
        onModeChange(mode);
    }
  }

  useEffect(() => {
    onClickEditTemplate(templateToEdit ? templateToEdit?.shapes : []);
    if(templateToEdit)
        setTemplateTitle(templateToEdit?.name)
  }, [templateToEdit]);

  const [isSaving, setIsSaving] = useState(false);

  const onClickSave = async () => {
    try {
        setIsSaving(true);
        await fetch(templateToEdit ? `${process.env.NEXt_API_BASE_URL}/template/${templateToEdit.id}` : "http://localhost:8080/template", {
            method: templateToEdit ? "put" : "post",
            body: JSON.stringify({
                name: templateTitle,
                shapes: rectangleList
            }),
            headers: {
                "Content-Type" : "application/json"
            }
        })
        refreshData();
    } catch(error){
        console.log("Error", error)
    } finally {
        setIsSaving(false);
    }
  }

  const onChangeTitle = (event: ChangeEvent<HTMLInputElement>) => {
    setTemplateTitle(event.target.value)
  }

  return (
  <div className="flex-1 draw-wrapper">
      <div
          className="h-full w-full rounded-md p-4" id="draw-board">
            <h1>{!templateToEdit ? "Create a template" : "Edit template"}</h1>
            <Input value={templateTitle} onChange={onChangeTitle} className="p-2.5 text-lg font-medium text-black" />
          <div className="flex h-full items-center">
          <div id = "canvasWrapper">
            <canvas ref={overlayRef} id="overlay" width={600} height={500}></canvas>
            <canvas ref={canvasRef} id="canvas" width={600} height={500}></canvas>
          </div>
          <div className="flex flex-col items-center flex-1 h-full p-6">
            <div className="flex justify-items-center mb-4">
                <div className="p-4">
                    <IconButton aria-label='Search database' icon={<RectangleVerticalIcon />} onClick={onClickModeOptions(Modes.RECTANGLE_DRAW)} border={mode === Modes.RECTANGLE_DRAW ? "1px solid blue" : undefined} />
                </div>
                <div className="p-4">
                    <IconButton aria-label='Search database' icon={<MoveIcon />} onClick={onClickModeOptions(Modes.MOVE)} border={mode === Modes.MOVE ? "1px solid blue" : undefined} />
                </div>
            </div>
            {/* <CirclePicker color={color} onChange={(e) => onColorChange(e.hex)} /> */}
            <UploadImage onSubmit={onSubmitImage} />
            <Button disabled={isSaving} style={{ marginTop: "20px"}} onClick={onClickSave}>{isSaving ? "Saving..." : "Save Template"}</Button>
            <Button onClick={onClickDownloadAsImage} style={{background: "blue", marginTop: "20px"}}>Download as Image</Button>
        </div>
      </div>
      </div>
  </div>
)
}

function MoveIcon(props) {
    return (
      <svg
        {...props}
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
        <polyline points="5 9 2 12 5 15" />
        <polyline points="9 5 12 2 15 5" />
        <polyline points="15 19 12 22 9 19" />
        <polyline points="19 9 22 12 19 15" />
        <line x1="2" x2="22" y1="12" y2="12" />
        <line x1="12" x2="12" y1="2" y2="22" />
      </svg>
    )
  }
  
  
  function RectangleVerticalIcon(props) {
    return (
      <svg
        {...props}
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
        <rect width="12" height="20" x="6" y="2" rx="2" />
      </svg>
    )
  }

function BrushIcon(props) {
return (
<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08" />
    <path
        d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z" />
</svg>
)
}


function CircleIcon(props) {
return (
<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
</svg>
)
}


function MenuIcon(props) {
return (
<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
</svg>
)
}


function PaletteIcon(props) {
return (
<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
    <path
        d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
</svg>
)
}


function PencilIcon(props) {
return (
<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
</svg>
)
}


function RedoIcon(props) {
return (
<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 7v6h-6" />
    <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
</svg>
)
}


function ShapesIcon(props) {
return (
<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <circle cx="17.5" cy="17.5" r="3.5" />
</svg>
)
}


function SquareIcon(props) {
return (
<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" />
</svg>
)
}


function TrashIcon(props) {
return (
<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
</svg>
)
}


function UndoIcon(props) {
return (
<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7v6h6" />
    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
</svg>
)
}
