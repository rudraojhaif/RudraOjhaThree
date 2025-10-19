import * as pdfjsLib from 'pdfjs-dist'
import * as THREE from 'three'

// Configure PDF.js worker - use local worker from node_modules
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

export class PDFRenderer {
  private canvas: HTMLCanvasElement
  private context: CanvasRenderingContext2D
  private texture: THREE.CanvasTexture | null = null
  private pdfDocument: any = null
  private scrollOffset: number = 0
  private totalHeight: number = 0
  private pageHeights: number[] = []

  constructor() {
    this.canvas = document.createElement('canvas')
    this.canvas.width = 1024
    this.canvas.height = 768
    this.context = this.canvas.getContext('2d')!
    this.setupFallbackDisplay()
  }

  private setupFallbackDisplay(): void {
    // Create a fallback display while PDF loads
    this.context.fillStyle = '#000000'
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)

    this.context.fillStyle = '#00ff00'
    this.context.font = '24px Courier New'
    this.context.textAlign = 'center'
    this.context.fillText('Loading PDF...', this.canvas.width / 2, this.canvas.height / 2)

    // Add scan lines for CRT effect
    this.addScanLines()
  }

  private addScanLines(): void {
    // Very subtle scan lines (reduced opacity from 0.1 to 0.03)
    this.context.fillStyle = 'rgba(0, 0, 0, 0.03)'
    for (let i = 0; i < this.canvas.height; i += 4) {
      this.context.fillRect(0, i, this.canvas.width, 1)
    }
  }

  async loadPDF(url: string): Promise<THREE.CanvasTexture> {
    try {
      const loadingTask = pdfjsLib.getDocument(url)
      this.pdfDocument = await loadingTask.promise

      // Calculate total height needed for all pages
      this.totalHeight = 0
      this.pageHeights = []

      for (let i = 1; i <= this.pdfDocument.numPages; i++) {
        const page = await this.pdfDocument.getPage(i)
        const viewport = page.getViewport({ scale: 1.5 })
        this.pageHeights.push(viewport.height + 20) // 20px gap between pages
        this.totalHeight += viewport.height + 20
      }

      // Set canvas width based on first page
      const firstPage = await this.pdfDocument.getPage(1)
      const firstViewport = firstPage.getViewport({ scale: 1.5 })
      this.canvas.width = Math.min(firstViewport.width, 1024)
      this.canvas.height = 768

      // Render with current scroll offset
      await this.renderCurrentView()

    } catch (error) {
      console.error('Error loading PDF:', error)
      this.createErrorDisplay()
    }

    this.texture = new THREE.CanvasTexture(this.canvas)
    this.texture.needsUpdate = true
    return this.texture
  }

  async renderCurrentView(): Promise<void> {
    if (!this.pdfDocument) return

    // Clear entire canvas completely
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.context.fillStyle = '#ffffff'
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // Reset any transforms or composite operations
    this.context.setTransform(1, 0, 0, 1, 0, 0)
    this.context.globalCompositeOperation = 'source-over'
    this.context.globalAlpha = 1.0

    let currentY = -this.scrollOffset
    const viewportHeight = this.canvas.height

    // Render visible pages
    for (let pageNum = 1; pageNum <= this.pdfDocument.numPages; pageNum++) {
      const pageHeight = this.pageHeights[pageNum - 1]

      // Check if page is visible in viewport
      if (currentY + pageHeight > 0 && currentY < viewportHeight) {
        const page = await this.pdfDocument.getPage(pageNum)
        const viewport = page.getViewport({ scale: 1.5 })

        // Save context state
        this.context.save()

        // Translate to page position
        this.context.translate(0, currentY)

        // Render page
        await page.render({
          canvasContext: this.context,
          viewport: viewport
        }).promise

        // Restore context state
        this.context.restore()
      }

      currentY += pageHeight

      // Stop if we're past the viewport
      if (currentY > viewportHeight) break
    }

    // Reset context state before applying effects
    this.context.setTransform(1, 0, 0, 1, 0, 0)
    this.context.globalCompositeOperation = 'source-over'

    // Apply CRT effects
    this.applyCRTEffect()
  }

  scroll(delta: number): void {
    const maxScroll = Math.max(0, this.totalHeight - this.canvas.height)
    this.scrollOffset = Math.max(0, Math.min(maxScroll, this.scrollOffset + delta))

    this.renderCurrentView().then(() => {
      if (this.texture) {
        this.texture.needsUpdate = true
      }
    })
  }

  getScrollProgress(): number {
    const maxScroll = Math.max(1, this.totalHeight - this.canvas.height)
    return this.scrollOffset / maxScroll
  }

  private applyCRTEffect(): void {
    // Ensure we're starting with clean state
    this.context.globalAlpha = 1.0

    // Add very subtle green tint overlay (reduced from 0.3 to 0.08 for better visibility)
    this.context.globalCompositeOperation = 'multiply'
    this.context.fillStyle = 'rgba(0, 255, 0, 0.08)'
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // Reset composite operation
    this.context.globalCompositeOperation = 'source-over'

    // Add subtle scan lines
    this.addScanLines()

    // Add very subtle noise
    this.addNoise()

    // Ensure we reset to default state
    this.context.globalCompositeOperation = 'source-over'
    this.context.globalAlpha = 1.0
  }

  private addNoise(): void {
    const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height)
    const data = imageData.data

    // Reduced noise: 0.5% chance (was 2%), smaller noise range (was ±25, now ±15)
    for (let i = 0; i < data.length; i += 4) {
      if (Math.random() < 0.005) {
        const noise = Math.random() * 30 - 15
        data[i] = Math.max(0, Math.min(255, data[i] + noise))     // R
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)) // G
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)) // B
      }
    }

    this.context.putImageData(imageData, 0, 0)
  }

  private createErrorDisplay(): void {
    this.context.fillStyle = '#000000'
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)

    this.context.fillStyle = '#ff0000'
    this.context.font = '32px Courier New'
    this.context.textAlign = 'center'
    this.context.fillText('PDF LOAD ERROR', this.canvas.width / 2, this.canvas.height / 2 - 50)

    this.context.fillStyle = '#00ff00'
    this.context.font = '20px Courier New'
    this.context.fillText('Resume display failed', this.canvas.width / 2, this.canvas.height / 2)
    this.context.fillText('Check console for details', this.canvas.width / 2, this.canvas.height / 2 + 30)
  }

  updateTexture(): void {
    if (this.texture) {
      this.texture.needsUpdate = true
    }
  }

  getTexture(): THREE.CanvasTexture | null {
    return this.texture
  }
}