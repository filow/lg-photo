import PosterRender, {EFitMode, ETextAlign} from "./PosterRender";
import {sizes} from "./config";

export function makeUserSnap(fileB64: string, socialName: string, socialImg: string, userName: string) {
    const p = new PosterRender({
        pixelRatio: 1,
        width: sizes.width,
        height: sizes.height,
    });
    p.addRect({
        x: 0,
        y: 0,
        w: sizes.width,
        h: sizes.height,
        style: '#ffffff'
    })
    p.addImage({
        url: fileB64,
        x: 0,
        y: 0,
        w: sizes.picWidth,
        h: sizes.picHeight,
        fitMode: EFitMode.Full,
    });
    // p.addImage({
    //     url: socialImg,
    //     x: sizes.picWidth - 52 - 10,
    //     y: sizes.picHeight - 52 - 10,
    //     w: 52,
    //     h: 52,
    //     fitMode: EFitMode.Full,
    // });
    p.addText({
        text: userName,
        x: sizes.text.x,
        y: sizes.text.y,
        w: sizes.text.w,
        rotate: 0,
        style: {
            font: `${sizes.text.size}px Arial`,
            fillStyle: sizes.text.color,
            align: ETextAlign.Center
        }
    });
    p.addText({
        text: socialName,
        x: sizes.socialName.x,
        y: sizes.socialName.y,
        w: sizes.socialName.w,
        rotate: 0,
        style: {
            font: `${sizes.socialName.size}px 宋体`,
            fillStyle: sizes.socialName.color,
            align: ETextAlign.Center
        }
    });
    return p.render();
}
