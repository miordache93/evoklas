import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';


@Injectable({
    providedIn: 'root'
})
export class FileService {
    constructor(private domSanitizer: DomSanitizer) { }

    convertImage(arrayBuffer: any): any {
        const TYPED_ARRAY = new Uint8Array(arrayBuffer);

        const STRING_CHAR = TYPED_ARRAY.reduce((data, byte) => {
            return data + String.fromCharCode(byte);
        }, '');
        const base64String = btoa(STRING_CHAR);
        return this.domSanitizer.bypassSecurityTrustUrl(`data:image/jpg;base64, ${base64String}`);
    }
}
