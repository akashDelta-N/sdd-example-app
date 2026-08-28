import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiTextInput } from './ui-text-input';

describe('UiTextInput', () => {
  let fixture: ComponentFixture<UiTextInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UiTextInput] }).compileComponents();
    fixture = TestBed.createComponent(UiTextInput);
  });

  function input(): HTMLInputElement {
    return fixture.nativeElement.querySelector('input');
  }

  it('renders the value written by the form', async () => {
    fixture.componentInstance.writeValue('Lisbon');
    await fixture.whenStable();

    expect(input().value).toBe('Lisbon');
  });

  it('treats a null value as empty', async () => {
    fixture.componentInstance.writeValue(null);
    await fixture.whenStable();

    expect(input().value).toBe('');
  });

  it('propagates typed values back to the form', async () => {
    const changes: string[] = [];
    fixture.componentInstance.registerOnChange((value: string) => changes.push(value));
    await fixture.whenStable();

    input().value = 'Porto';
    input().dispatchEvent(new Event('input'));

    expect(changes).toEqual(['Porto']);
  });

  it('reflects the disabled state', async () => {
    fixture.componentInstance.setDisabledState(true);
    await fixture.whenStable();

    expect(input().disabled).toBe(true);
  });
});
