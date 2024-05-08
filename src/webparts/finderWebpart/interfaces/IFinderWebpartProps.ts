import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IFinderWebpartProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  context: WebPartContext;
  selectedDocument: string;
  getDocLibrary: any;
}
export interface IFinderWebpartWebPartProps {
  description: string;
  selectedDocument: string;
  getDocLibrary: any;


}

export interface IFinderWebpartState {
  getDocFolder: any;
  getDocFiles: any;
  filesInSelectedFolder: any;
  selectedFolder: any;
  breadcrumbItems: any;
  searchQuery: any;
  filteredFiles: any;
  filteredFolders: any;

}