import { AfterContentChecked, ChangeDetectorRef, Component, ElementRef, forwardRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

const noop = () => {};

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => NgbpTimepickerComponent),
  multi: true
};

export interface Time {
  hour: number;
  minute: number;
}

@Component({
  selector: 'ngbp-timepicker',
  template: `
    <input
      type="text"
      name="timepicker"
      #timepicker
      [ngModel]="time"
      (click)="click($event)"
      (keydown)="keydown($event)"
      (keypress)="keypress($event)"
      (keyup)="keyup($event)"
      (blur)="blur()"
      class="form-control"
    />
  `,
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR],
})
export class NgbpTimepickerComponent implements AfterContentChecked, ControlValueAccessor {

  @ViewChild('timepicker') private timepicker: ElementRef|undefined;

  private innerValue: Time = {
    hour: 0,
    minute: 0,
  };

  private onTouchedCallback: () => void = noop;
  private onChangeCallback: (_: any) => void = noop;

  get value(): any {
    return this.innerValue;
  }

  set value(v: any) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      this.onChangeCallback(v);
    }
  }

  part: number|null = null;

  minuteBuffer: any[] = [];
  hourBuffer: any[] = [];

  get time(): string|null {
    if (!this.innerValue) { return null; }
    return `${(this.innerValue.hour % 12) || 12}:${this.innerValue.minute.toString().padStart(2, '0')} ${this.periodString}`;
  }

  get periodString(): string {
    return this.innerValue.hour > 11 ? 'pm' : 'am';
  }

  get adjustment(): number {
    return (((this.innerValue.hour % 12) || 12) < 10) ? 1 : 0;
  }

  constructor(
    private cd: ChangeDetectorRef,
  ) {}

  ngAfterContentChecked() {
    if (this.part !== null) { this.selectPart(this.part); }
  }

  click(event: Event) {
    const position = this.timepicker!.nativeElement.selectionStart;
    const partIndex = this.getPartIndex(position);
    this.selectPart(partIndex);
  }

  blur() {
    this.part = null;
    this.onTouchedCallback();
  }

  keydown(event: KeyboardEvent) {
    if (this.part === null && ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      this.selectPart(0);
    }

    const part = this.part;

    switch (event.key) {
      case 'ArrowLeft':
        if (this.part! > 0) {
          this.selectPart(this.part! - 1);
        } else if (this.part === null) {
          this.selectPart(2);
        }
        event.preventDefault();
        break;
      case 'ArrowRight':
        if (this.part === null) {
          this.selectPart(0);
        } else if (this.part < 2) {
          this.selectPart(this.part + 1);
        }
        event.preventDefault();
        break;
      case 'Tab':
        if (event.shiftKey) {
          if (this.part! > 0) {
            this.selectPart(this.part! - 1);
          } else if (this.part === null) {
            this.selectPart(2);
          } else {
            return;
          }
        } else {
          if (this.part === 0 || this.part === 1) {
            this.selectPart(this.part + 1);
          } else if (this.part === null) {
            this.selectPart(0);
          } else {
            return;
          }
        }
        event.preventDefault();
        break;
      case 'ArrowUp':
        if (part === 0) { this.innerValue.hour = ((this.innerValue.hour + 1) % 24); }
        if (part === 1) { this.innerValue.minute = ((this.innerValue.minute + 1) % 60); }
        if (part === 2) { this.innerValue.hour = (this.innerValue.hour + 12) % 24; }
        this.minuteBuffer = [];
        this.hourBuffer = [];
        event.preventDefault();
        this.cd.detectChanges();
        break;
      case 'ArrowDown':
        if (part === 0) { this.innerValue.hour = this.mod(this.innerValue.hour - 1, 24); }
        if (part === 1) { this.innerValue.minute = this.mod((this.innerValue.minute - 1), 60); }
        if (part === 2) { this.innerValue.hour = this.mod(this.innerValue.hour - 12, 24); }
        this.minuteBuffer = [];
        this.hourBuffer = [];
        event.preventDefault();
        this.cd.detectChanges();
        break;
      case 'Backspace':
      case 'Delete':
        if (part === 0) { this.innerValue.hour = 0; }
        if (part === 1) { this.innerValue.minute = 0; }
        if (part === 2) { if (this.innerValue.hour > 11) { this.innerValue.hour -= 12; } }

        if (event.key === 'Backspace' && this.part! > 0) {
          this.selectPart(this.part! - 1);
        }

        event.preventDefault();
        this.cd.detectChanges();
        break;
      case 'A':
      case 'a':
        if (part === 2) { if (this.innerValue.hour > 11) { this.innerValue.hour -= 12; } }
        event.preventDefault();
        this.cd.detectChanges();
        break;
      case 'P':
      case 'p':
        if (part === 2) { if (this.innerValue.hour < 12) { this.innerValue.hour += 12; } }
        event.preventDefault();
        this.cd.detectChanges();
        break;
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        if (part === 0) {
          const pm = this.innerValue.hour > 11;
          if (this.hourBuffer.length === 0 && parseInt(event.key, 10) > 1) {
            this.hourBuffer.push('0');
          } else if (this.hourBuffer.length === 0 && parseInt(event.key, 10) === 0) {
            this.innerValue.hour = 0 + (pm ? 12 : 0);
            this.selectPart(1);
            event.preventDefault();
            this.cd.detectChanges();
            return;
          }
          if (this.hourBuffer[0] === '1' && parseInt(event.key, 10) > 2) {
            this.hourBuffer[0] = '0';
          }
          this.hourBuffer.push(event.key);
          const n = parseInt(this.hourBuffer.join(''), 10) % 12;
          this.innerValue.hour = n + (pm ? 12 : 0);
          if (this.hourBuffer.length >= 2) {
            this.selectPart(1);
          }
        }
        if (part === 1) {
          if (this.minuteBuffer.length === 0 && parseInt(event.key, 10) > 5) {
            this.minuteBuffer.push('0');
          }
          this.minuteBuffer.push(event.key);
          this.innerValue.minute = parseInt(this.minuteBuffer.join(''), 10);
          if (this.minuteBuffer.length >= 2) {
            this.selectPart(2);
          }
        }
        event.preventDefault();
        this.cd.detectChanges();
        break;
    }

    event.preventDefault();
  }

  keypress(event: KeyboardEvent) {}

  keyup(event: KeyboardEvent) {}

  getPartIndex(cursorPosition: number) {
    cursorPosition += this.adjustment;
    return Math.floor(cursorPosition / 3);
  }

  selectPart(index: number) {
    if (this.part !== index) {
      this.minuteBuffer = [];
      this.hourBuffer = [];
    }
    this.part = index;

    const selectionStart = (index * 3) - this.adjustment;
    const selectionEnd = selectionStart + 2;

    this.timepicker!.nativeElement.setSelectionRange(0, 0);
    this.timepicker!.nativeElement.setSelectionRange(Math.max(0, selectionStart), selectionEnd);
  }

  mod(n: number, m: number): number {
    return ((n % m) + m) % m;
  }

  // From ControlValueAccessor interface

  writeValue(value: any) {
    if (value !== this.innerValue) {
      this.innerValue = value;
    }
  }

  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }

}
