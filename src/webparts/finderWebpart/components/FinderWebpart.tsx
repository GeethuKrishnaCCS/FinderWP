import * as React from 'react';
import styles from './FinderWebpart.module.scss';
import { IFinderWebpartProps, IFinderWebpartState } from '../interfaces/IFinderWebpartProps';
import { Breadcrumb, DefaultButton, IIconProps, IconButton, SearchBox } from '@fluentui/react';
import { FinderWebpartService } from '../services';
// import { escape } from '@microsoft/sp-lodash-subset';
// import { IDocumentLibraryInformation } from "@pnp/sp/sites";

export default class FinderWebpart extends React.Component<IFinderWebpartProps, IFinderWebpartState, {}> {
  private _service: any;

  public constructor(props: IFinderWebpartProps) {
    super(props);
    this._service = new FinderWebpartService(this.props.context);

    this.state = {
      getDocFolder: [],
      getDocFiles: [],
      filesInSelectedFolder: [],
      selectedFolder: null,
      breadcrumbItems: [{ text: this.props.selectedDocument, key: this.props.selectedDocument }], // Initial breadcrumb item
      searchQuery: '',
      filteredFiles: [],
      filteredFolders: [],
    }
    this.getDocFiles = this.getDocFiles.bind(this);
    this.getDocFolder = this.getDocFolder.bind(this);
    this.handleFolderSelection = this.handleFolderSelection.bind(this);
    // this.handleBreadcrumbItemClick = this.handleBreadcrumbItemClick.bind(this);

  }


  public async componentDidMount() {
    await this.getDocFiles();
    await this.getDocFolder();
  }

  public async getDocFiles() {
    const getDocFiles = await this._service.getDocumentLibraryFiles(this.props.selectedDocument);
    console.log('getDocFiles: ', getDocFiles);
    this.setState({ getDocFiles: getDocFiles });

  }

  public async getDocFolder() {
    const getDocFOLDER = await this._service.getDocumentLibraryFolder(this.props.selectedDocument);
    console.log('getDocFOLDER: ', getDocFOLDER);
    this.setState({ getDocFolder: getDocFOLDER });
  }

  public async handleFolderSelection(folder: any) {
    const files = await this._service.getfilesfromfolder(folder.ServerRelativeUrl);
    const subfolders = await this._service.getfoldersfromfolder(folder.ServerRelativeUrl);

    await Promise.all(subfolders.map(async (subfolder: any) => {
      const subfolderFiles = await this._service.getfilesfromfolder(subfolder.ServerRelativeUrl);
      const subfolderSubfolders = await this._service.getfoldersfromfolder(subfolder.ServerRelativeUrl);
      subfolder.files = subfolderFiles;
      subfolder.subfolders = subfolderSubfolders;
    }));

    const breadcrumbItems = [...this.state.breadcrumbItems, { text: folder.Name, key: folder.UniqueId }];
    this.setState({ filesInSelectedFolder: files, selectedFolder: { ...folder, subfolders }, breadcrumbItems });
  }

  private handleSearchQueryChange(newValue: string): void {
    this.setState({ searchQuery: newValue }, this.filterFilesAndFolders);
  }




  private async filterFilesAndFolders(): Promise<void> {
    const { searchQuery } = this.state;
    const filteredFiles: any[] = [];
    const filteredFolders: any[] = [];

    const searchInFolder = async (folder: any): Promise<void> => {
      const folderFiles = await this._service.getfilesfromfolder(folder.ServerRelativeUrl);
      const subfolders = await this._service.getfoldersfromfolder(folder.ServerRelativeUrl);

      const filteredFolderFiles = folderFiles.filter((file: any) => file.Title.toLowerCase().includes(searchQuery.toLowerCase()));
      filteredFiles.push(...filteredFolderFiles);

      const filteredSubfolders = subfolders.filter((subfolder: any) => subfolder.Name.toLowerCase().includes(searchQuery.toLowerCase()));
      filteredFolders.push(...filteredSubfolders);

      await Promise.all(subfolders.map(async (subfolder: any) => {
        await searchInFolder(subfolder);
      }));
    };

    const rootFolders = await this._service.getDocumentLibraryFolder(this.props.selectedDocument);
    await Promise.all(rootFolders.map(async (rootFolder: any) => {
      await searchInFolder(rootFolder);
    }));

    const rootFiles = await this._service.getDocumentLibraryFiles(this.props.selectedDocument);
    const filteredRootFiles = rootFiles.filter((file: any) => file.Title.toLowerCase().includes(searchQuery.toLowerCase()));
    filteredFiles.push(...filteredRootFiles);

    const filteredRootFolders = rootFolders.filter((rootFolder: any) => rootFolder.Name.toLowerCase().includes(searchQuery.toLowerCase()));
    filteredFolders.push(...filteredRootFolders);

    console.log('Filtered Files:', filteredFiles);
    console.log('Filtered Folders:', filteredFolders);

    this.setState({ filteredFiles, filteredFolders });
  }



  public render(): React.ReactElement<IFinderWebpartProps> {

    const {
      // description,
      // isDarkTheme,
      // environmentMessage,
      hasTeamsContext,
      // userDisplayName
    } = this.props;
    const KnowledgeArticle: IIconProps = { iconName: 'KnowledgeArticle' };
    const hasSearchResults = this.state.filteredFiles.length > 0 || this.state.filteredFolders.length > 0;

    return (
      <section className={`${styles.finderWebpart} ${hasTeamsContext ? styles.teams : ''}`}>
        <div className={styles.borderBox}>
          <div>
            <SearchBox
              placeholder="Search"
              onChange={(_, newValue) => this.handleSearchQueryChange(newValue)}
            />
            {/* <div>{this.props.selectedDocument}</div> */}
            <Breadcrumb
              items={this.state.breadcrumbItems}
              ariaLabel="Breadcrumb navigation"
              overflowAriaLabel="More links"


            />
            {hasSearchResults ? (
              <div>
                <h3>Search Results</h3>
                <ul>
                  {this.state.filteredFolders.map((folder: any) => (
                    <DefaultButton
                      key={folder.UniqueId}
                      className={styles.button}
                      onClick={() => this.handleFolderSelection(folder)}
                    >
                      {folder.Name}
                    </DefaultButton>
                  ))}
                  {this.state.filteredFiles.map((file: any) => (
                    <div key={file.Id}>
                      <IconButton iconProps={KnowledgeArticle} ariaLabel="File icon" />
                      <a href={file.ServerRelativeUrl} target="_blank" >
                        {file.Title}
                      </a>
                    </div>
                  ))}
                </ul>
              </div>
            ) : (
              <div>
                {this.state.selectedFolder ? (
                  <div>
                    <table>
                      <tbody>
                        {this.state.filesInSelectedFolder.map((item: any) => (
                          <tr key={item.Id}>
                            <td>
                              <IconButton iconProps={KnowledgeArticle} ariaLabel="File icon" />
                            </td>
                            <td>
                              <a href={item.ServerRelativeUrl} target="_blank" >
                                {item.Title}
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <ul>
                      {this.state.selectedFolder.subfolders.map((subfolder: any) => (
                        <DefaultButton
                          key={subfolder.UniqueId}
                          className={styles.button}
                          onClick={() => this.handleFolderSelection(subfolder)}
                        >
                          {subfolder.Name}
                        </DefaultButton>
                      ))}
                    </ul>
                  </div>

                ) : (
                  <div>
                    <ul>
                      {this.state.getDocFolder.map((item: any) => (
                        <DefaultButton
                          key={item.Id}
                          className={styles.button}
                          onClick={() => this.handleFolderSelection(item)}
                        >
                          {item.Name}
                        </DefaultButton>
                      ))}
                    </ul>
                    <hr></hr>
                    <table>
                      <tbody>
                        {this.state.getDocFiles.map((item: any) => (
                          <tr key={item.Id}>
                            <td>
                              <IconButton
                                iconProps={KnowledgeArticle}
                                ariaLabel="File icon"
                              />
                            </td>
                            <td>
                              <a href={item.ServerRelativeUrl} target="_blank" >
                                {item.Title}
                              </a>

                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }
}


