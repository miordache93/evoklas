import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  OnDestroy,
  OnChanges,
  HostListener,
  ChangeDetectorRef,
} from '@angular/core';
import { NavigationEnd, Router, ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { Scroller } from 'primeng/scroller';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SkeletonModule } from 'primeng/skeleton';
import { ScrollerModule } from 'primeng/scroller';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { AuthService } from 'apps/evoklas/src/app/core/auth/services/auth.service';
import { HttpClientService } from 'apps/evoklas/src/app/core/http/services/http-client.service';
import { MessagesService } from '../../services/messages.service';
import { RequestsDataService } from '../../../requests/services/requests.service';
import { RequestDetailsComponent } from '../request-details/request-details.component';

/**
 * GET MESSAGES FLOW
 * - SELECT REQUEST (CANCEL EXISTING POLL MESSAGES)
 * - GET MESSAGES PAGE NUMBER IN ORDER TO START POLLING
 * - START POLLING MESSAGES WITH PAGINATION -> RETURN LAST 5/10 MESSAGES ORDERED BY DATE
 * - INSIDE lazyLoadMessages()
 */

@Component({
  selector: 'app-messages-page',
  templateUrl: './messages-page.component.html',
  styleUrls: ['./messages-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ConfirmDialogModule,
    ScrollerModule,
    InputTextModule,
    TextareaModule,
    AvatarModule,
    BadgeModule,
    PanelModule,
    ButtonModule,
    SkeletonModule,
    RequestDetailsComponent,
  ],
})
export class MessagesPageComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('textbox') textMessageBox: ElementRef = new ElementRef(null);
  @ViewChild('requestContainer') requestContainer: ElementRef = new ElementRef(
    null
  );
  @ViewChild('mvs') mvs: Scroller | undefined;

  // Lazyloaded requests
  pageSize = 20;
  pageCount = 0;
  totalPages = 0;
  totalItems = 0;
  scrollRefPoint = 0;
  actualHeight = 0;
  lastScrollTop = 0;
  isSetScrollListener = false;

  // Lazy loaded messages
  messagesPageSize = 10;
  messagesTotalItems = 0;
  messagesTotalPages: any = null;
  messagesPageCount: any = 0;
  isScrolling: any = null;
  forcedScroll = false;
  virtualScrollCdk: any;

  selectedRequest: any = null;
  requestId: any = null;
  currentUser: any = null;
  activeState = [false, false, false];
  textMessage = '';
  searchText = '';
  searchConvText = '';
  fileMessage: any;
  currentUrl = '/messages';
  messages: any = [];
  messages$: any = new Observable();
  requestsSubscription = new Subscription();
  msgs: any[] = [];
  requests: any = [];
  virtualRequests: any[] = [];
  virtualMessages: any[] = [];
  virtualMessages$: any = new Observable();
  messagePollSubscription: Subscription = new Subscription();
  requestsLoading = false;
  messagesLoading = false;
  isMobile = false;
  showConversation = false;

  // Dynamic layout
  messageLayout = 'row';
  messageListAlignment = 'space-between';
  messagesContainerFlex = '65';

  // File upload vars
  messageAttachment: any;
  uploadedFileBytesData: any;

  constructor(
    private httpClientDataService: HttpClientService,
    private messagesService: MessagesService,
    private requestsService: RequestsDataService,
    private router: Router,
    private domSanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.updateViewMode();
    this.requestId = this.route.snapshot.paramMap.get('requestId') || null;

    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.url;
      }
    });

    this.authService.currentUser.subscribe((user: any) => {
      this.currentUser = user;

      if (!user) {
        if (this.messagePollSubscription) {
          this.messagePollSubscription.unsubscribe();
        }
      }
    });

    this.loadRequestsLazy({ reset: true });
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateViewMode();
  }

  private updateViewMode(): void {
    const mobile = window.innerWidth <= 1024;
    if (this.isMobile !== mobile) {
      this.isMobile = mobile;
      if (!mobile) {
        this.showConversation = false;
      }
    }
  }

  readRequestMessages(requestId: any): any {
    return this.messagesService.readRequestMessages(requestId);
  }

  ngOnChanges(changes: any): void {
    console.log('requests.loading:', changes.requestsLoading);
    console.log(changes);
  }

  async onFileUpload(event: any): Promise<any> {
    if (event.target.files) {
      // fileMessage: any - store it for sending it to backend
      this.fileMessage = event.target.files[0];
      // messageAttachment: string - store it fto display uploaded file name
      this.messageAttachment = event.target.files[0].name;

      // Logic for storing the file's btyes Array in order to be able to open it in a new tab
      const fileData = new Blob([event.target.files[0]]);
      const promise = new Promise(this.getBuffer(fileData));

      promise.then(
        (res) => {
          this.uploadedFileBytesData = res;
        },
        (err) => {
          this.messageAttachment = `Error uploading your file`;
        }
      );
    }
  }

  getBuffer(fileData: any): any {
    return (resolve: any) => {
      const reader: any = new FileReader();
      reader.readAsArrayBuffer(fileData);
      reader.onload = () => {
        const arrayBuffer = reader.result;
        const bytes = new Uint8Array(arrayBuffer);
        resolve(bytes);
      };
    };
  }

  onFileClicked(): void {
    const file = new Blob([this.uploadedFileBytesData], {
      type: 'application/pdf',
    });
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL);
  }

  onAttachmentClicked(filePath: any): void {
    const fileExtension = filePath.split('.').pop();
    let type = '';

    switch (fileExtension) {
      case 'pdf':
        type = 'application/pdf';
        break;
      case 'png':
        type = 'image/png';
        break;
      case 'xls':
        // tbd
        break;
      case 'doc':
        type = 'application/octet-stream';
        break;
      case 'docx':
        type = 'application/octet-stream';
        break;
      default:
        break;
    }

    this.httpClientDataService
      .downloadFileAttachment({
        filePath,
      })
      .subscribe(
        (res) => {
          const blob = new Blob([res], { type });
          const downloadURL = window.URL.createObjectURL(res);
          const link = document.createElement('a');
          link.href = downloadURL;
          link.download = `Oferta.${fileExtension}`;
          link.click();
        },
        (err) => {
          console.log(err);
        }
      );
  }

  removeAttachment(): void {
    this.fileMessage = null;
    this.messageAttachment = '';
  }

  convertImage(arrayBuffer: any): any {
    const TYPED_ARRAY = new Uint8Array(arrayBuffer);

    const STRING_CHAR = TYPED_ARRAY.reduce((data, byte) => {
      return data + String.fromCharCode(byte);
    }, '');
    const base64String = btoa(STRING_CHAR);
    return this.domSanitizer.bypassSecurityTrustUrl(
      `data:application/pdf;base64, ${base64String}`
    );
  }

  sendMessage(text: string): void {
    const message = {
      text,
      receiverId: this.selectedRequest.user.id,
      attachment: this.fileMessage || null,
      reqId: this.selectedRequest.id,
    };

    this.messagesService.sendMessaage(message).subscribe((res: any) => {
      this.textMessage = '';
      this.textMessageBox.nativeElement.value = '';
      this.uploadedFileBytesData = null;
      this.fileMessage = null;
      this.messageAttachment = '';
      setTimeout(() => {
        this.scrollMessageContainer();
      }, 500);
      this.loadMessagesLazy();
    });
  }

  trackByFunction(index: number, item: any): any {
    return item.id;
  }

  getMessages(): void {
    this.messagesService.getMessages(this.selectedRequest.id);
  }

  pollMessages(request: any): void {
    this.messagesService.cleanupMessagePoll();
    if (this.selectedRequest.readable) {
      this.readRequestMessages(request.id).subscribe(() => {
        this.selectedRequest.unreadMessages = 0;
        this.getMessages();
      });
    }
  }

  goToPackages(): void {
    this.router.navigate(['/subscriptions']);
  }

  useCredit(request: any): void {
    if (!request?.id || !this.currentUser) {
      return;
    }

    this.httpClientDataService.useCredit(request.id).subscribe(
      () => {
        request.readable = true;
        if (typeof this.currentUser.requestsLimit === 'number') {
          this.currentUser.requestsLimit = Math.max(
            0,
            this.currentUser.requestsLimit - 1
          );
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  loadRequestsLazy(event: any): void {
    if (event && event.reset) {
      this.pageCount = 0;
      this.totalItems = 0;
      this.totalPages = 0;
      this.virtualRequests = [];
    }

    if (this.requestsLoading) {
      return;
    }

    if (
      this.totalItems !== 0 &&
      this.totalItems <= this.virtualRequests.length
    ) {
      return;
    }

    const query: any = {
      size: this.pageSize,
      page: this.pageCount,
      readable: true,
    };

    if (this.searchText) {
      query.name = this.searchText;
    }

    if (this.requestId) {
      query.preselectedRequestId = this.requestId;
    }

    this.requestsLoading = true;
    this.httpClientDataService.getRequestsV2(query).subscribe(
      (res) => {
        const requestItems = Array.isArray(res)
          ? res
          : res.client_requests ??
            res.requests ??
            res.data ??
            res.items ??
            res.results ??
            [];
        this.totalItems = res.totalItems ?? requestItems.length;
        this.totalPages = res.totalPages ?? 1;

        if (requestItems.length) {
          this.pageCount++;
        }

        this.virtualRequests = [
          ...new Map(
            [...this.virtualRequests, ...requestItems].map((v) => [v.id, v])
          ).values(),
        ];
        if (this.requestId) {
          const preselected = this.virtualRequests.find(
            (r) => r.id === +this.requestId
          );
          if (preselected) {
            this.selectRequest(preselected);
          }
        } else if (!this.selectedRequest && this.virtualRequests.length) {
          if (this.isMobile) {
            this.selectedRequest = this.virtualRequests[0];
          } else {
            this.selectRequest(this.virtualRequests[0]);
          }
        }
        this.requestsLoading = false;
        this.cdr.markForCheck();
      },
      () => {
        this.requestsLoading = false;
        this.cdr.markForCheck();
      },
      () => {
        this.requestsLoading = false;
        this.cdr.markForCheck();
      }
    );
  }

  loadMessagesLazy(_event?: any): void {
    if (!this.selectedRequest || this.messagesLoading) {
      return;
    }

    const query: any = {
      size: this.messagesPageSize,
      page: this.messagesPageCount,
    };

    this.messagesLoading = true;
    this.messagesService
      .getMessagesV2(this.selectedRequest.id, query)
      .subscribe(
        (res: any) => {
          this.messagesTotalItems = res.totalItems;
          this.messagesTotalPages = res.totalPages;

          this.virtualMessages = [
            ...new Map(
              [...this.virtualMessages, ...res.messages]
                .sort(
                  (a, b) =>
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
                )
                .map((v) => [v.id, v])
            ).values(),
          ];
        },
        () => {
          this.messagesLoading = false;
        },
        () => {
          this.messagesLoading = false;
        }
      );

    this.scrollMessageContainer();
  }

  scrollMessageContainer(): void {
    if (this.mvs) {
      const scrollEl = this.mvs.el?.nativeElement?.getElementsByClassName(
        'cdk-virtual-scroll-viewport'
      )?.[0];
      if (!scrollEl) {
        return;
      }
      const scrollHeight = scrollEl.scrollHeight;
      if (this.actualHeight !== scrollHeight) {
        this.actualHeight = scrollHeight;
        setTimeout(() => {
          scrollEl.scrollTo(0, this.actualHeight);
        }, 500);
      }

      if (
        scrollEl.eventListeners().length === 3 ||
        scrollEl.eventListeners().length === 0
      ) {
        let lastScrollTop = scrollEl.scrollTop;

        scrollEl.addEventListener('scroll', (evt: any) => {
          const st = scrollEl.scrollTop;

          if (st > lastScrollTop) {
          } else if (st < lastScrollTop) {
            if (
              st < 200 &&
              this.messagesTotalItems > this.virtualMessages.length
            ) {
              this.messagesPageCount++;
              this.loadMessagesLazy();
            }
          } else {
            console.log('horizontal scroll');
          }
          lastScrollTop = Math.max(st, 0); // For mobile or negative scrolling
        });
      }
    }
  }

  selectRequest(request: any): void {
    this.lastScrollTop = 0;
    this.virtualMessages = [];
    this.selectedRequest = request;
    request.messages = 0;
    this.requestId = null;
    if (this.isMobile) {
      this.showConversation = true;
    }
    this.messagesLoading = true;
    // Start polling messages and sync with already lazy loaded messages
    this.messagesService.readRequestMessages(request.id).subscribe(() => {
      if (this.messagePollSubscription) {
        this.messagePollSubscription.unsubscribe();
      }

      const query: any = {
        size: 10,
        page: 0,
      };

      this.messagePollSubscription = this.messagesService
        .getMessagesV2(request.id, query)
        .pipe(this.messagesService.pollWhile(3000, (res) => true))
        .subscribe((res) => {
          this.virtualMessages = [
            ...new Map(
              [...this.virtualMessages, ...res.messages]
                .sort(
                  (a, b) =>
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
                )
                .map((v) => [v.id, v])
            ).values(),
          ];
          this.messagesLoading = false;
        });
    });
  }

  searchByRequestName(name: string): void {
    this.pageCount = 0;
    this.totalItems = 0;
    this.totalPages = 0;
    this.virtualRequests = [];
    this.requestId = null;
    this.requestsLoading = true;
    this.requestsService
      .getRequestsV2({
        size: this.pageSize,
        page: this.pageCount,
        name: this.searchText,
      })
      .subscribe(
        (res) => {
          this.totalItems = res.totalItems;
          this.totalPages = res.totalPages;
          this.virtualRequests = [
            ...this.virtualRequests,
            ...res.client_requests,
          ];
        },
        () => {
          this.requestsLoading = false;
        },
        () => {
          this.requestsLoading = false;
        }
      );
  }

  goBackToRequestList(): void {
    this.selectedRequest = null;
    this.requestId = null;
    this.messagesLoading = false;
    this.showConversation = false;
    this.router.navigate(['/messages']);
    if (this.messagePollSubscription) {
      this.messagePollSubscription.unsubscribe();
    }
  }

  ngOnDestroy(): void {
    this.messagesService.cleanupMessagePoll();
    this.requestsSubscription.unsubscribe();

    if (this.messagePollSubscription) {
      this.messagePollSubscription.unsubscribe();
    }
  }
}
