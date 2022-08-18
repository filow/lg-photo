// // const fs = require('fs');
// // const path = require('path');
//
// a4纸的像素宽度为585.28
function getSizeCm(size: number) {
    const unit = 595.28 / 21;
    return size * unit;
}

export const sizes = {
    width: 295,
    height: 295,
    picWidth: 295,
    picHeight: 224,
    text: {
        x: 0,
        y: 229 + 26 - 5,
        w: 295,
        size: 26,
        color: '#000'
    },
    socialName: {
        x: 0,
        y: 262 + 24 - 5,
        w: 295,
        size: 24,
        color: '#000'
    },
    print: {
        width: getSizeCm(2.5),
        height: getSizeCm(2.5),
        marginRight: getSizeCm(.2),
        marginBottom: getSizeCm(.43 + 0.3 / 7),
        pagePaddingLeft: getSizeCm(.83),
        pagePaddingTop: getSizeCm(.14),
        lines: 9,
        cols: 7
    }
}

// const configFile = path.join(process.cwd(), 'config.json');
// let currentConfig: Record<string, number> = {
//     pagePaddingTop: .14,
//     pagePaddingLeft: .83,
//     width: 2.5,
//     height: 2.5,
//     marginRight: .2,
//     marginBottom: .473,
//     lines: 9,
//     cols: 7
// };
// export function getRawPrintConfig() {
//     try {
//         const content = fs.readFileSync(configFile);
//         let config = JSON.parse(content);
//         if (config.print) {
//             currentConfig = config.print;
//             return currentConfig;
//         }
//         else {
//             throw new Error('111');
//         }
//     }
//     catch(e) {
//         fs.writeFileSync(configFile, JSON.stringify({
//             print: currentConfig
//         }, null, 2));
//         return currentConfig;
//     }
// }
// export function getPrintConfig() {
//    const rawConfig = getRawPrintConfig();
//    const result: Record<string, number> = {};
//    Object.keys(rawConfig).forEach(key => {
//        if (['lines', 'cols'].includes(key)) {
//            result[key] = rawConfig[key];
//        }
//        else {
//            result[key] = getSizeCm(rawConfig[key]);
//        }
//    });
//    return result;
// }
//
// export function setPrintConfig(configData: Record<string, number | string>) {
//     const data: Record<string, number> = {};
//     Object.keys(configData).forEach(key => {
//         data[key] = Number(configData[key]);
//     });
//     currentConfig = data;
//     fs.writeFileSync(configFile, JSON.stringify({
//         print: data
//     }, null, 2));
// }
