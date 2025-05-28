// pdf-viewer.component.ts - Fixed version
import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

export interface SignatureArea {
  x: number;
  y: number;
  width: number;
  height: number;
  pageNumber: number;
}

@Component({
  selector: 'app-pdf-viewer',
  imports: [CommonModule],
  templateUrl: './pdf-viewer.component.html',
  styleUrl: './pdf-viewer.component.css',
  
})
export class PdfViewerComponent implements AfterViewInit {
  @Input() pdfUrl: string = '';
  @Output() signatureAreaSelected = new EventEmitter<SignatureArea[]>();
  @ViewChild('pdfCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private pdfDoc: any = null;
  private pdfjsLib: any = null;
  
  currentPage = 1;
  totalPages = 0;
  selectionMode = false;
  isSelecting = false;
  isBrowser = false;
  
  selectionRect = { x: 0, y: 0, width: 0, height: 0 };
  startPoint = { x: 0, y: 0 };
  signatureAreas: SignatureArea[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async ngAfterViewInit() {
    if (this.isBrowser && this.pdfUrl) {
      await this.initializePdfJs();
      await this.loadPdf();
    }
  }

  private async initializePdfJs() {
    try {
      // Dynamic import to avoid SSR issues
      this.pdfjsLib = await import('pdfjs-dist');
      
      // Use matching worker version - get the version from the imported library
      const version = this.pdfjsLib.version || '3.11.174';
      this.pdfjsLib.GlobalWorkerOptions.workerSrc = `/assets/pdf.worker.min.mjs`;
      
    } catch (error) {
      console.error('Error loading PDF.js:', error);
    }
  }

  async loadPdf() {
    if (!this.pdfjsLib || !this.pdfUrl) return;
    
    try {
      const loadingTask = this.pdfjsLib.getDocument(this.pdfUrl);
      this.pdfDoc = await loadingTask.promise;
      this.totalPages = this.pdfDoc.numPages;
      await this.renderPage();
    } catch (error) {
      console.error('Error loading PDF:', error);
    }
  }

  async renderPage() {
    if (!this.pdfDoc || !this.canvasRef) return;

    const page = await this.pdfDoc.getPage(this.currentPage);
    const canvas = this.canvasRef.nativeElement;
    const context = canvas.getContext('2d');
    
    const viewport = page.getViewport({ scale: 1.5 });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };

    await page.render(renderContext).promise;
    
    // Clears the signature areas for different pages
     this.signatureAreas = this.signatureAreas.filter(area => area.pageNumber === this.currentPage);
  }

  async prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      await this.renderPage();
    }
  }

  async nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      await this.renderPage();
    }
  }

  toggleSelectionMode() {
    this.selectionMode = !this.selectionMode;
    if (!this.selectionMode) {
      this.isSelecting = false;
    }
  }

  onMouseDown(event: MouseEvent) {
    if (!this.selectionMode || !this.canvasRef) return;

    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    this.startPoint = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    
    this.isSelecting = true;
    this.selectionRect = {
      x: this.startPoint.x,
      y: this.startPoint.y,
      width: 0,
      height: 0
    };
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isSelecting || !this.canvasRef) return;

    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const currentPoint = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    this.selectionRect = {
      x: Math.min(this.startPoint.x, currentPoint.x),
      y: Math.min(this.startPoint.y, currentPoint.y),
      width: Math.abs(currentPoint.x - this.startPoint.x),
      height: Math.abs(currentPoint.y - this.startPoint.y)
    };
  }

  onMouseUp(event: MouseEvent) {
    if (!this.isSelecting) return;

    this.isSelecting = false;
    
    // Only create signature area if selection is large enough
    if (this.selectionRect.width > 20 && this.selectionRect.height > 10) {
      const signatureArea: SignatureArea = {
        x: this.selectionRect.x,
        y: this.selectionRect.y,
        width: this.selectionRect.width,
        height: this.selectionRect.height,
        pageNumber: this.currentPage
      };
      
      this.signatureAreas.push(signatureArea);
      this.signatureAreaSelected.emit([signatureArea]);
    }
    
    this.selectionMode = false;
  }

  removeSignatureArea(index: number) {
    this.signatureAreas.splice(index, 1);
  }
}