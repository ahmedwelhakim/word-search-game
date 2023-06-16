import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable()
export class CanvasService {
  private renderer: Renderer2;
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;

  constructor(private rendererFactory: RendererFactory2) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
    this.canvas = this.renderer.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }
}
