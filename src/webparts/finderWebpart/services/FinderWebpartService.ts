import { BaseService } from "./BaseService";
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { getSP } from "../shared/Pnp/pnpjsConfig";
import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/site-groups/web";
import "@pnp/sp/sites";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import "@pnp/sp/security";
// import { IDocumentLibraryInformation } from "@pnp/sp/sites";
import "@pnp/sp/lists";
import "@pnp/sp/items";

export class FinderWebpartService extends BaseService {
    private _spfi: SPFI;
    constructor(context: WebPartContext) {
        super(context);
        this._spfi = getSP(context);
    }
    public addListItem(data: any, listname: string, url: string): Promise<any> {
        return this._spfi.web.getList(url + "/Lists/" + listname).items.add(data);
    }
    public getDocLibrary(url: string): Promise<any> {
        return this._spfi.site.getDocumentLibraries(url);
    }
    // public getDocFile(data: any): Promise<any> {
    //     return this._spfi.web.lists.getByTitle(data).items.getAll();
    // }
    public getDocumentLibraryFiles(data: any): Promise<any> {
        return this._spfi.web.lists.getByTitle(data).rootFolder.files();
    }
    // public getDocumentLibraryFolder(data: any): Promise<any> {
    //     return this._spfi.web.lists.getByTitle(data).rootFolder.folders();
    // }
    public getDocumentLibraryFolder(data: any): Promise<any[]> {
        return this._spfi.web.lists.getByTitle(data)
            .rootFolder
            .folders()
            .then((folders: any[]) => {
                return folders.filter(folder => folder.Name !== "Forms");
            });
    }
    public getfilesfromfolder(data: any): Promise<any> {
        return this._spfi.web.getFolderByServerRelativePath(data).files();
    }
    // public getfoldersfromfolder(data: any): Promise<any> {
    //     return this._spfi.web.getFolderByServerRelativePath(data).folders();
    // }
    public async getfoldersfromfolder(data: any): Promise<any> {
        const folders = await this._spfi.web.getFolderByServerRelativePath(data).folders();
        return Promise.all(folders.map(async (folder: any) => {
            const subfolderFiles = await this.getfilesfromfolder(folder.ServerRelativeUrl);
            const subfolderSubfolders = await this.getfoldersfromfolder(folder.ServerRelativeUrl);
            return { ...folder, files: subfolderFiles, subfolders: subfolderSubfolders };
        }));
    }
}