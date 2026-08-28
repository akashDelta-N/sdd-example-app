import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiButton } from './ui-button';

describe('UiButton', () => {
  let fixture: ComponentFixture<UiButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UiButton] }).compileComponents();
    fixture = TestBed.createComponent(UiButton);
  });

  function button(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button');
  }

  it('applies the variant class to the host', async () => {
    fixture.componentRef.setInput('variant', 'danger');
    await fixture.whenStable();

    expect(fixture.nativeElement.classList).toContain('variant-danger');
  });

  it('emits when clicked', async () => {
    const clicks: unknown[] = [];
    fixture.componentInstance.clicked.subscribe(() => clicks.push(true));
    await fixture.whenStable();

    button().click();

    expect(clicks).toHaveLength(1);
  });

  it('does not emit while disabled', async () => {
    const clicks: unknown[] = [];
    fixture.componentInstance.clicked.subscribe(() => clicks.push(true));
    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();

    button().click();

    expect(clicks).toHaveLength(0);
  });
});
