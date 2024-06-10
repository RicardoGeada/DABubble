'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">da-bubble documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#components-links"' :
                            'data-bs-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/AddChannelCardComponent.html" data-type="entity-link" >AddChannelCardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AddMemberCardComponent.html" data-type="entity-link" >AddMemberCardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AppComponent.html" data-type="entity-link" >AppComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AvatarComponent.html" data-type="entity-link" >AvatarComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ChannelComponent.html" data-type="entity-link" >ChannelComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CheckEmailComponent.html" data-type="entity-link" >CheckEmailComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DialogAddMemberComponent.html" data-type="entity-link" >DialogAddMemberComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DialogAddMemberMobileComponent.html" data-type="entity-link" >DialogAddMemberMobileComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DialogEditChannelComponent.html" data-type="entity-link" >DialogEditChannelComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DialogEditProfileComponent.html" data-type="entity-link" >DialogEditProfileComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DialogEmojiPickerComponent.html" data-type="entity-link" >DialogEmojiPickerComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DialogShowMembersComponent.html" data-type="entity-link" >DialogShowMembersComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DialogShowProfileComponent.html" data-type="entity-link" >DialogShowProfileComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/EmailSnackbarComponent.html" data-type="entity-link" >EmailSnackbarComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HeaderComponent.html" data-type="entity-link" >HeaderComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ImprintComponent.html" data-type="entity-link" >ImprintComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LoginComponent.html" data-type="entity-link" >LoginComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LoginPageComponent.html" data-type="entity-link" >LoginPageComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LoginSnackbarComponent.html" data-type="entity-link" >LoginSnackbarComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LogOutDialogComponent.html" data-type="entity-link" >LogOutDialogComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MainHeaderComponent.html" data-type="entity-link" >MainHeaderComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MainMenuChannelsComponent.html" data-type="entity-link" >MainMenuChannelsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MainMenuComponent.html" data-type="entity-link" >MainMenuComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MainMenuDmComponent.html" data-type="entity-link" >MainMenuDmComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MainMenuHeaderComponent.html" data-type="entity-link" >MainMenuHeaderComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MainPageComponent.html" data-type="entity-link" >MainPageComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MessageComponent.html" data-type="entity-link" >MessageComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MessageInputComponent.html" data-type="entity-link" >MessageInputComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PrivacyPolicyComponent.html" data-type="entity-link" >PrivacyPolicyComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ResetPasswordComponent.html" data-type="entity-link" >ResetPasswordComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SearchBarComponent.html" data-type="entity-link" >SearchBarComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SearchResultsComponent.html" data-type="entity-link" >SearchResultsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SignInComponent.html" data-type="entity-link" >SignInComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ThreadComponent.html" data-type="entity-link" >ThreadComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UserCreatedSnackbarComponent.html" data-type="entity-link" >UserCreatedSnackbarComponent</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#directives-links"' :
                                'data-bs-target="#xs-directives-links"' }>
                                <span class="icon ion-md-code-working"></span>
                                <span>Directives</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="directives-links"' : 'id="xs-directives-links"' }>
                                <li class="link">
                                    <a href="directives/OpenProfileDirective.html" data-type="entity-link" >OpenProfileDirective</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/User.html" data-type="entity-link" >User</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/ChannelFirebaseService.html" data-type="entity-link" >ChannelFirebaseService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CustomDialogService.html" data-type="entity-link" >CustomDialogService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MessageService.html" data-type="entity-link" >MessageService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ProfileService.html" data-type="entity-link" >ProfileService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ReactionService.html" data-type="entity-link" >ReactionService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SearchService.html" data-type="entity-link" >SearchService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SharedService.html" data-type="entity-link" >SharedService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/StateManagementService.html" data-type="entity-link" >StateManagementService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ThreadService.html" data-type="entity-link" >ThreadService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserAuthService.html" data-type="entity-link" >UserAuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserManagementService.html" data-type="entity-link" >UserManagementService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserService.html" data-type="entity-link" >UserService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UtilityService.html" data-type="entity-link" >UtilityService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/Channel.html" data-type="entity-link" >Channel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DialogParams.html" data-type="entity-link" >DialogParams</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Message.html" data-type="entity-link" >Message</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Reaction.html" data-type="entity-link" >Reaction</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/User.html" data-type="entity-link" >User</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});