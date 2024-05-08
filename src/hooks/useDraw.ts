'use client'
import { Modes } from "@/types/enums";
import { useEffect, useRef, useState } from "react"

export const useDraw = () => {
    const [rectangleList, setRectangleList] = useState<RectangleProperties[]>(
    []
    );
    const [color, setColor] = useState("blue")
    const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
    const [mode, setMode] = useState<Modes>(Modes.RECTANGLE_DRAW)
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayRef = useRef<HTMLCanvasElement>(null);
    let startX = 0;
    let startY = 0;
    let isDown = false;
    let prevStartX = 0;
    let prevStartY = 0;
    let prevWidth = 0;
    let prevHeight = 0;
    let newRectangle: RectangleProperties | null = null;
    let currentRectangeMoving: number | null = null;
    useEffect(() => {
        if(canvasRef.current && overlayRef.current) {
            // style the context
            canvasRef.current.addEventListener("mousedown" , handleMouseDown);
            canvasRef.current.addEventListener("mousemove" , handleMouseMove);
            canvasRef.current.addEventListener("mouseup" , handleMouseUp);
            canvasRef.current.addEventListener("mouseout" , handleMouseOut);
            const canvasWrapper = document.getElementById("canvasWrapper");
            if(canvasWrapper && canvasWrapper.style.width) {
                canvasRef.current.width = parseInt(canvasWrapper.style.width) * 2
            }
            const ctx = canvasRef.current.getContext("2d");
            const ctxo = overlayRef.current.getContext("2d");
            if(ctx && ctxo) {
                ctx.strokeStyle = color;
                ctx.lineWidth = 3;
                ctxo.strokeStyle = color;
                ctxo.lineWidth = 3;
            }
        }
        return () => {
            if(canvasRef.current) {
                canvasRef.current.removeEventListener("mousedown" , handleMouseDown);
                canvasRef.current.removeEventListener("mousemove" , handleMouseMove);
                canvasRef.current.removeEventListener("mouseup" , handleMouseUp);
                canvasRef.current.removeEventListener("mouseout" , handleMouseOut);
            }
        }
    }, [mode, rectangleList]);

    function drawShapes() {
        const canvas = canvasRef.current;
        if(canvas) {
            const ctx = canvas.getContext("2d");
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
            console.log("aya backgroundImage --->", backgroundImage)
            if(backgroundImage)
                ctx?.drawImage(backgroundImage,0,0, canvas.width, canvas.height);
            rectangleList.forEach((rectangle) => {
                ctx?.strokeRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
            });
        }
    }

    useEffect(() => {
        drawShapes();  
    }, [rectangleList, backgroundImage]);

    useEffect(() => {
        const canvasWrapper = document.getElementById("canvasWrapper");
        const cursors = {
            [Modes.MOVE]: "move",
            [Modes.RECTANGLE_DRAW]: "crosshair"
        }
        if(canvasWrapper)
            canvasWrapper.style.cursor = cursors[mode];
    }, [mode]);

    function isMouseOnRectangle(x: number, y: number, rectangle: RectangleProperties){
        const rect_left = rectangle.x;
        const rect_right = rectangle.x + rectangle.width;
        const rect_top = rectangle.y;
        const rect_bottom = rectangle.y + rectangle.height;
        return x > rect_left && x < rect_right && y > rect_top && y < rect_bottom;
    }

    function handleMouseDown(e: MouseEvent) {
        const canvas = canvasRef.current;
        if(!canvas) return;
        if(mode === Modes.RECTANGLE_DRAW) {
            e.preventDefault();
            e.stopPropagation();
            const rect = canvas.getBoundingClientRect();
            const offsetX = rect.left;
            const offsetY = rect.top;
            // save the starting x/y of the rectangle
            startX = e.clientX - offsetX;
            startY = e.clientY - offsetY;
            // set a flag indicating the drag has begun
            isDown = true;
        } else {
            const rect = canvas.getBoundingClientRect();
            const offsetX = rect.left;
            const offsetY = rect.top;
            startX = e.clientX - offsetX;
            startY = e.clientY - offsetY;
            let index = 0;
            for (const rectangle of rectangleList) {
                if(isMouseOnRectangle(startX, startY, rectangle)){
                    currentRectangeMoving = index;
                    isDown = true;
                    return;
                }
                index++;
            }
        }
    }

    function handleMouseUp(e: MouseEvent) {
        if(!overlayRef.current) return;
        e.preventDefault();
        e.stopPropagation();
        const ctxo = overlayRef.current.getContext("2d");
        if(!ctxo) return;
        // the drag is over, clear the dragging flag
        isDown = false;
        console.log("false kr dun")
        setRectangleList((prevValues) => [...(prevValues || []), ...(newRectangle ? [newRectangle] : [])])
        ctxo.strokeRect(prevStartX, prevStartY, prevWidth, prevHeight);
    }

    function handleMouseOut(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();

        // the drag is over, clear the dragging flag
        isDown = false;
        console.log("false kr dun")
        newRectangle = null;
    }

    function handleMouseMove(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        // if we're not dragging, just return
        if (!isDown) {
            return;
        }

        if(!canvasRef.current || !overlayRef.current) return;

        const canvas = canvasRef.current;
        if(mode === Modes.RECTANGLE_DRAW) {
            const rect = canvasRef.current.getBoundingClientRect();
            const offsetX = rect.left;
            const offsetY = rect.top;
            const ctx = canvasRef.current.getContext("2d");
    
            // get the current mouse position
            const mouseX = (e.clientX - offsetX);
            const mouseY = (e.clientY - offsetY);
            // Put your mousemove stuff here
    
            // calculate the rectangle width/height based
            // on starting vs current mouse position
            var width = mouseX - startX;
            var height = mouseY - startY;
    
            // clear the canvas
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
            drawShapes();
            // draw a new rect from the start position
            // to the current mouse position
            ctx?.strokeRect(startX, startY, width, height);
            newRectangle = {x: startX, y: startY, width, height}
    
            prevStartX = startX;
            prevStartY = startY;
    
            prevWidth = width;
            prevHeight = height;
        } else {
            console.log("moving....")
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            let dx = mouseX - startX;
            let dy = mouseY - startY;
            console.log("dx", dx, {mouseX})
            console.log("dy", dy, {mouseY})
            let newRectangleList = [...rectangleList];
            newRectangleList = newRectangleList.map((rectangle, index) => {
                return index === currentRectangeMoving ? {...rectangle, x: dx, y: dy} : rectangle;
            })
            setRectangleList(newRectangleList);
            startX = mouseX;
            startY = mouseY;
        }
    }

    const onModeChange = (mode: Modes) => {
        setMode(mode);
    }

    const onSubmitImage = (image: HTMLImageElement) => {
        setBackgroundImage(image);
    }

    function onClickDownloadAsImage(){
        var canvas = canvasRef.current;
        if(!canvas) return;
        var url = canvas.toDataURL("image/png");
        var link = document.createElement('a');
        link.download = 'filename.png';
        link.href = url;
        link.click();
    }

    const onClickEditTemplate = (shapes: RectangleProperties[]) => {
        const canvas = canvasRef.current;
        const ctx = canvasRef?.current?.getContext("2d");
        if(canvas) ctx?.clearRect(0, 0, canvas.width, canvas.height);
        setRectangleList(shapes);
    }

    const onColorChange = (colorValue: string) => {
        setColor(colorValue);
        const canvas = canvasRef.current;
        const overlatCanvas = overlayRef.current;
        const ctx = canvas?.getContext("2d");
        const ctxo = overlatCanvas?.getContext("2d");
        if(ctx && ctxo) {
            ctx.strokeStyle = color;
            ctxo.strokeStyle = color;
        }
    }

    return { canvasRef, overlayRef, onModeChange, mode, onSubmitImage, onClickDownloadAsImage, onClickEditTemplate, rectangleList, color, onColorChange }
}
