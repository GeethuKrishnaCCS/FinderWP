import { WebPartContext } from '@microsoft/sp-webpart-base';
import { getSP } from "../shared/Pnp/pnpjsConfig";
import { SPFI } from "@pnp/sp";


export class BaseService {
    private _sp: SPFI;
    constructor(context: WebPartContext) {
        this._sp = getSP(context);
    }
    public add(data: any, listname: string): Promise<any> {
        return this._sp.web.getList(listname).items.add(data);
    }    
}





