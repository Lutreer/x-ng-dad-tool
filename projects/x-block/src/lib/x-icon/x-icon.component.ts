/*
 * @Author         : Shang
 * @Date           : 2024-06-25
 * @LastEditors    : Shang
 * @LastEditTime   : 2025-05-07
 * @Description    :
 * Copyright (c) 2025 by Crepri, All Rights Reserved.
 */
import { Component, Input, OnInit } from '@angular/core';

type IconType =
  | 'quality-out'
  | 'quality-in'
  | 'flag'
  | 'lighting'
  | 'thunderbolt'
  | 'tune'
  | 'keyboard_arrow_up'
  | 'keyboard_arrow_down'
  | 'close';

@Component({
  selector: 'x-icon',
  templateUrl: './x-icon.component.html',
  styleUrls: ['./x-icon.component.scss'],
})
export class XIconComponent implements OnInit {
  @Input({ required: true })
  public xType!: IconType;

  @Input()
  public xColor = '#ffffff';

  @Input()
  public xSize = '16px';

  @Input()
  public xFrame = false;

  @Input()
  public xFrameHeight = '24px';

  @Input()
  public xFrameWidth = '24px';

  @Input()
  public xFrameColor = '#808080';

  ngOnInit(): void {}

  get frameBackgroundColor() {
    return this.xFrame ? this.xFrameColor : '';
  }
}
