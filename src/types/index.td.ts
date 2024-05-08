type Draw = {
    ctx: CanvasRenderingContext2D;
    currentPoint: Point;
    prevPoint: Point | null;
}

type Point = {x: number; y: number}

interface RectangleProperties {x: number; y: number; height: number; width: number; _id?: string;}

interface Templates {
    id: string,
    name: string,
    shapes: RectangleProperties[]
}
