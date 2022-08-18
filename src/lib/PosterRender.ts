/**
 * 海报图片渲染库
 */


// === 枚举值 ===
// 支持的渲染类型
export enum ERenderTypes {
    Image,
    Text,
    QRCode,
    Rect,
}
// 图片适配模式
export enum EFitMode {
    // 包含，必须让图片完整以自己的比例显示，且包含在容器内
    Contain,
    // 封面模式，容器内会填满图片，图片以原始比例显示，默认居中定位
    Cover,
    // 拉伸图片以填满窗口
    Full
}
// 文本对齐模式
export enum ETextAlign {
    Left,
    Center,
    Right
}


// === 接口定义 ===
interface CommonRenderOptions {
    x: number,
    y: number,
}
// 图片渲染参数
interface TImageRenderOptions extends CommonRenderOptions{
    url: string,
    width: number,
    height: number,
    fitMode: EFitMode,
    borderRadius: number,
    rotate: number
}

// 文本渲染参数
interface TTextRenderOptions extends CommonRenderOptions {
    font: string,
    fillStyle: string,
    text: string,
    rotate: number
}

// QR码渲染参数
interface TQRCodeRenderOptions extends CommonRenderOptions {
    id: string,
    textB64: Promise<string>,
    width: number,
    height: number,
    rotate: number
}

interface TRectRenderOptions extends CommonRenderOptions {
    style: string | CanvasGradient,
    width: number,
    height: number,
    borderRadius: number
}

type RenderOptions = TImageRenderOptions | TTextRenderOptions | TQRCodeRenderOptions | TRectRenderOptions;
interface RenderDescriptions<T> {
    type: ERenderTypes,
    data: T
}

export default class PosterRender {
    // 图片的像素比例，用来保持跟设计稿相对应的像素数值，方便开发
    private pixelRatio: number;
    // 整个图片的宽度
    private width: number;
    // 整个图片的高度
    private height: number;
    // Canvas对象
    public ctx: CanvasRenderingContext2D;
    // 渲染队列
    private renderQueue: RenderDescriptions<RenderOptions>[];
    constructor({pixelRatio, width, height}: {
        pixelRatio: number,
        width: number,
        height: number
    })
    {
        this.pixelRatio = pixelRatio;
        this.width = width * pixelRatio;
        this.height = height * pixelRatio;
        this.renderQueue = [];

        const bgCanvas = document.createElement('canvas');
        bgCanvas.width = this.width;
        bgCanvas.height = this.height;
        const ctx = bgCanvas.getContext('2d');
        if (ctx) {
            this.ctx = ctx;
        }
        else {
            // do noting;
            throw new Error('Can not get 2d context');
        }
    }

    public addImage({url, x, y, w, h, fitMode = EFitMode.Full, borderRadius = 0, rotate = 0}: {
        url: string,
        x: number,
        y: number,
        w: number,
        h: number,
        fitMode?: EFitMode,
        borderRadius?: number,
        rotate?: number
    }) {
        this.renderQueue.push({
            type: ERenderTypes.Image,
            data: {
                url,
                x: x * this.pixelRatio,
                y: y * this.pixelRatio,
                width: w * this.pixelRatio,
                height: h * this.pixelRatio,
                fitMode,
                borderRadius: borderRadius * this.pixelRatio,
                rotate: rotate
            }
        })
    }

    public addRect({x, y, w, h, style, borderRadius}: {
        x: number,
        y: number,
        w: number,
        h: number,
        style: string | CanvasGradient,
        borderRadius?: number
    }) {
        this.renderQueue.push({
            type: ERenderTypes.Rect,
            data: {
                x: x * this.pixelRatio,
                y: y * this.pixelRatio,
                width: w * this.pixelRatio,
                height: h * this.pixelRatio,
                style,
                borderRadius: borderRadius && borderRadius * this.pixelRatio || 0
            }
        })
    }

    public addText({text, style, x, y, w, rotate = 0}: {
        text: string,
        style: {
            font: string,
            fillStyle: string,
            lineHeight?: number,
            align?: ETextAlign,
            textEllipsis?: string,
            lines?: number,
            highlight?: {
                font: string,
                fillStyle: string
            },
        },
        x: number,
        y: number,
        w: number,
        rotate: number
    })
    {
        const {fillStyle, align = ETextAlign.Left, textEllipsis = '', lines = 1} = style;
        x = x * this.pixelRatio;
        y = y * this.pixelRatio;
        w = w * this.pixelRatio;
        let font = style.font;
        let lineHeight = style.lineHeight && style.lineHeight * this.pixelRatio;
        const highlight = style.highlight || {font, fillStyle};
        font = font.replace(/(\d+)px/g, (_, fontSize: string) => {
            return Number(fontSize) * this.pixelRatio + 'px'
        });
        highlight.font = highlight.font.replace(/(\d+)px/g, (_, fontSize: string) => {
            return Number(fontSize) * this.pixelRatio + 'px'
        });
        if (!lineHeight) {
            this.ctx.save();
            this.ctx.font = font;
            // 中文字符宽高一致
            lineHeight = this.ctx.measureText('测').width;
            this.ctx.restore();
        }
        // 包含强调字符
        interface ITextListItem {
            text: string,
            font: string,
            fillStyle: string,
            width: number,
        }
        const textList: ITextListItem[] = [];

        this.ctx.save();
        // 按照强调与否，先拆分不同样式的字符
        if (/\*\*[^*]+\*\*/.test(text)) {
            let currentIndex = 0;
            text.replace(/\*\*[^*]+\*\*/g, (a:string, ...args: any[]) => {
                const matchIndex = Number(args[0]);
                const substr = text.substring(currentIndex, matchIndex);
                currentIndex = matchIndex;
                this.ctx.font = font;
                textList.push({
                    text: substr,
                    font,
                    fillStyle,
                    width: this.ctx.measureText(substr).width,
                });
                // 强调文字
                this.ctx.font = highlight.font;
                const highlightText = a.substring(2, a.length - 2);
                textList.push({
                    text: highlightText,
                    font: highlight.font,
                    fillStyle: highlight.fillStyle,
                    width: this.ctx.measureText(highlightText).width
                });
                currentIndex += a.length;
                return '';
            });
            const finalPart = text.substring(currentIndex);
            if (finalPart.length > 0) {
                this.ctx.font = font;
                textList.push({
                    text: finalPart,
                    font: font,
                    fillStyle: fillStyle,
                    width: this.ctx.measureText(finalPart).width
                });
            }
        }
        else {
            this.ctx.font = font;
            textList.push({
                text,
                font,
                fillStyle,
                width: this.ctx.measureText(text).width
            });
        }
        // console.log(JSON.stringify(textList, null, 2))
        // 接下来开始排版
        let currentWidth = 0;
        let currentLines = 1;
        let currentY = y;
        let containerWidth = w;
        let renderQueueCache: RenderDescriptions<RenderOptions>[] = [];
        const flushRenderQueueCache = (contentWidth: number) => {
            const offset = containerWidth - contentWidth;
            // console.log(contentWidth, containerWidth, offset);
            // console.log(JSON.stringify(renderQueueCache, null,2))
            if (offset > 0) {
                if (align === ETextAlign.Center) {
                    const o = offset / 2;
                    renderQueueCache.forEach(item => {
                        item.data.x += o;
                    });
                }
                else if (align === ETextAlign.Right) {
                    renderQueueCache.forEach(item => {
                        item.data.x += offset;
                    });
                }
            }
            renderQueueCache.forEach(item => this.renderQueue.push(item));
            renderQueueCache = [];
        }
        while(textList.length > 0) {
            const item = textList.shift();
            if (!item) {
                break;
            }
            // 如果加上后面的文字之后，会导致换行，就需要考虑换行或者加省略号
            if (currentWidth + item.width > containerWidth) {
                // console.log('会超出：', item.text);
                if (currentLines >= lines) {
                    // 当前行数已经超出，所以只能省略
                    const ellipsisMeasure = textEllipsis ? this.ctx.measureText(textEllipsis).width : 0;
                    const [left] = this.getWidthLimitedText(item.text, item.font, containerWidth - currentWidth - ellipsisMeasure);
                    if (left && left.length > 0) {
                        renderQueueCache.push({
                            type: ERenderTypes.Text,
                            data: {
                                text: left + textEllipsis,
                                font: item.font,
                                fillStyle: item.fillStyle,
                                x: x + currentWidth,
                                y: currentY,
                                rotate
                            }
                        });
                        const leftWidth = this.ctx.measureText(left).width;
                        currentWidth += leftWidth + ellipsisMeasure;
                    }
                    flushRenderQueueCache(currentWidth);
                    break;
                }
                else {
                    const [left, right] = this.getWidthLimitedText(item.text, item.font, containerWidth - currentWidth);
                    if (left && left.length > 0) {
                        const leftWidth = this.ctx.measureText(left).width;
                        // console.log(left, 'leftWidth:' + leftWidth)
                        renderQueueCache.push({
                            type: ERenderTypes.Text,
                            data: {
                                text: left,
                                font: item.font,
                                fillStyle: item.fillStyle,
                                x: x + currentWidth,
                                y: currentY,
                                rotate
                            }
                        });
                        currentWidth += leftWidth;
                        flushRenderQueueCache(currentWidth);
                    }

                    if (right && right.length > 0) {
                        // 剩下的内容重新推入数组，保证下轮循环渲染
                        textList.unshift({
                            text: right,
                            font: item.font,
                            fillStyle: item.fillStyle,
                            width: this.getTextWidth(right, item.font)
                        });
                    }
                    currentY += lineHeight;
                    currentWidth = 0;
                    currentLines++;
                    // console.log('换行');
                }
            }
            // 加上之后不会换行的场景，很简单
            else {
                renderQueueCache.push({
                    type: ERenderTypes.Text,
                    data: {
                        text: item.text,
                        font: item.font,
                        fillStyle: item.fillStyle,
                        x: x + currentWidth,
                        y: currentY,
                        rotate
                    }
                });
                currentWidth += item.width;
            }
        }
        flushRenderQueueCache(currentWidth);
        this.ctx.restore();
    }

    private getWidthLimitedText(originText: string, style: string, width: number) {
        this.ctx.save();
        this.ctx.font = style;
        let text = originText;
        let measure = this.ctx.measureText(text);
        do {
            // 英文黏连逻辑
            let newLastChar = text[text.length - 1];
            if (/[a-zA-Z.]/.test(newLastChar)) {
                text = text.replace(/[a-zA-Z.]+$/, '');
            }
            else {
                text = text.substring(0, text.length - 1);
            }
            measure = this.ctx.measureText(text);
        } while (measure.width > width);
        return [
            text,
            originText.substring(text.length)
        ]
    }

    private getTextWidth(text: string, style: string) {
        this.ctx.save();
        this.ctx.font = style;
        const result = this.ctx.measureText(text).width;
        this.ctx.restore();
        return result;
    }

    public addQrCode({textB64, x, y, w, h, rotate = 0}: {
        textB64: Promise<string> | string,
        x: number,
        y: number,
        w: number,
        h: number,
        rotate?: number
    }) {
        const text = typeof textB64 === 'string' ? Promise.resolve(textB64) : textB64;
        this.renderQueue.push({
            type: ERenderTypes.QRCode,
            data: {
                id: this.getId(),
                textB64: text,
                x: x * this.pixelRatio,
                y: y * this.pixelRatio,
                width: w * this.pixelRatio,
                height: h * this.pixelRatio,
                rotate
            }
        })
    }

    // 渲染方法，会把图片全部加载完成后再渲染
    public render(): Promise<string> {
        // 获取全部图片列表
        const images = this.renderQueue.map(item => {
            const itemData = item as RenderDescriptions<TImageRenderOptions>;
            return item.type === ERenderTypes.Image && itemData.data.url ? itemData.data.url : '';
        }).filter(item => item.length > 0);
        // 获取QR码列表
        const qrCodeEl = this.renderQueue.filter(item => item.type === ERenderTypes.QRCode);
        const qrCodes = qrCodeEl.map(item => (item.data as TQRCodeRenderOptions).textB64);
        const qrCodeIds = qrCodeEl.map(item => (item.data as TQRCodeRenderOptions).id);
        // 组合所有待加载的资源
        const queue = [
            ...images.map(url => this.loadImage(url)),
            ...qrCodes.map(textB64 => {
                return textB64.then(text => this.loadImage(text));
            })
        ];

        return Promise.all(queue).then((results) => {
            // 初始化资源映射表
            const imageMap: {[props: string]: HTMLImageElement} = {};
            images.forEach((url, i) => imageMap[url] = results[i]);
            qrCodeIds.forEach((id, i) => imageMap[id] = results[i + images.length]);
            // 开始render
            this.renderQueue.forEach(item => {
                switch (item.type) {
                    case ERenderTypes.Image: {
                        const data = item.data as TImageRenderOptions;
                        if (imageMap[data.url]) {
                            this.renderImageEl(imageMap[data.url], data);
                        }
                        break;
                    }
                    case ERenderTypes.QRCode: {
                        const data = item.data as TQRCodeRenderOptions;
                        this.renderImageEl(imageMap[data.id], {
                            ...data,
                            url: '',
                            fitMode: EFitMode.Full,
                            borderRadius: 0
                        });
                        break;
                    }
                    case ERenderTypes.Text: {
                        const data = item.data as TTextRenderOptions;
                        this.renderText(data);
                        break;
                    }
                    case ERenderTypes.Rect: {
                        const data = item.data as TRectRenderOptions;
                        this.renderRect(data);
                        break;
                    }
                }
            });
            // 清空待渲染队列
            this.renderQueue = [];
            return this.ctx.canvas.toDataURL('image/png');
        })
    }

    private makeBorderRadiusPath(x: number, y: number, width: number, height: number, radius: number) {
        const Point = (x: number, y: number) => ({x, y});
        // 圆角半径不允许大于
        const maxRadius = width > height ? width / 2 : height / 2;
        const r = radius > maxRadius ? maxRadius : radius;
        const ptA = Point(x + r, y);
        const ptB = Point(x + width, y);
        const ptC = Point(x + width, y + height);
        const ptD = Point(x, y + height);
        const ptE = Point(x, y);

        this.ctx.beginPath();
        this.ctx.moveTo(ptA.x, ptA.y);
        this.ctx.arcTo(ptB.x, ptB.y, ptC.x, ptC.y, r);
        this.ctx.arcTo(ptC.x, ptC.y, ptD.x, ptD.y, r);
        this.ctx.arcTo(ptD.x, ptD.y, ptE.x, ptE.y, r);
        this.ctx.arcTo(ptE.x, ptE.y, ptA.x, ptA.y, r);
    }

    private renderImageEl(el: HTMLImageElement, data: TImageRenderOptions) {
        const {width, height, x, y, fitMode, borderRadius} = data;
        this.ctx.save();
        // 渲染圆角
        if (borderRadius) {
            this.makeBorderRadiusPath(x, y, width, height, borderRadius);
            this.ctx.clip();
        }
        if (data.rotate) {
            const angle = (data.rotate % 360) * Math.PI / 180;
            this.ctx.rotate(angle);
        }
        // 全渲染，直接绘制即可
        if (fitMode === EFitMode.Full) {
            this.ctx.drawImage(el, x, y, width, height);
        }
        else if (fitMode === EFitMode.Contain) {
            const w = el.width;
            const h = el.height;
            if (w > h) {
                const tw = width;
                const th = tw / w * h;
                const offsetH = (tw - th) / 2;
                this.ctx.drawImage(el, x, y + offsetH, tw, th);
            }
            else {
                const th = height;
                const tw = th / h * w;
                const offsetW = (th - tw) / 2;
                this.ctx.drawImage(el, x + offsetW, y, tw, th);
            }
        }
        else if (fitMode === EFitMode.Cover) {
            const w = el.width;
            const h = el.height;
            if (width > height) {
                // h比较小，以这个图片的h对标height
                const tw = width;
                const th = tw / w * h;
                const offsetH = (th - h) / 2;
                this.ctx.drawImage(el, x, y - offsetH, tw, th);
            }
            else {
                const th = height;
                const tw = th / h * w;
                const offsetW = (tw - width) / 2;
                this.ctx.drawImage(el, x - offsetW, y, tw, th);
            }
        }
        this.ctx.restore();
    }

    private renderRect(data: TRectRenderOptions) {
        const {x, y, width, height, style, borderRadius} = data;
        this.ctx.save();
        // 渲染圆角
        if (borderRadius) {
            this.makeBorderRadiusPath(x, y, width, height, borderRadius);
            this.ctx.clip();
        }
        this.ctx.fillStyle = style;
        this.ctx.fillRect(x, y, width, height);
        this.ctx.restore();
    }

    private renderText(data: TTextRenderOptions) {
        const {font, fillStyle, x, y} = data;
        let text = data.text;
        this.ctx.save();
        if (data.rotate) {
            const angle = (data.rotate % 360) * Math.PI / 180;
            this.ctx.rotate(angle);
        }
        this.ctx.font = font;
        this.ctx.fillStyle = fillStyle;
        this.ctx.fillText(text, x, y);
        this.ctx.restore();
    }

    private loadImage(src: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = function () {
                resolve(img);
            };
            img.onerror = () => {
                // error callback
                // 展示需要
                reject();
            }
            img.src = src;
            if(img.complete) {
                resolve(img);
            }
        });
    }

    private getId() {
        return Math.random().toString(16).split('.')[1];
    }
}

