import { CommonModule } from '@angular/common';
import { Component, linkedSignal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

interface BudgetEntry {
  id: number;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  interval: 'one-time' | 'weekly' | 'monthly';
  date: Date;
}

@Component({
  selector: 'app-main',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './main.html',
  styleUrl: './main.css',
})
export class BudgetDashboardComponent {
  entries: BudgetEntry[] = [];
  showEntryWindow = false;
  showMonthlyBudgetWindow = true;
  private nextId = 0;

  entryForm = new FormGroup({
    amount: new FormControl(null, [Validators.min(0.01), Validators.required]),
    type: new FormControl<'income' | 'expense'>('income', Validators.required),
    description: new FormControl('', Validators.required),
    interval: new FormControl<'one-time' | 'weekly' | 'monthly'>(
      'one-time',
      Validators.required
    ),
  });

  monthlyBudgetForm = new FormGroup({
    amount: new FormControl(null, [Validators.min(0.01), Validators.required]),
  });

  ngOnInit() {
    this.entries = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      const item = localStorage.getItem(key);
      if (!item) continue;

      const parsedItem = JSON.parse(item);
      if (!parsedItem) continue;

      if (parsedItem.description === 'Monthly Budget Entry') continue;

      this.entries.push(parsedItem);
    }
  }

  deleteEntry(id: number) {
    if (
      this.entries.find((entry) => entry.id === id)?.description ===
      'Monthly Budget Entry'
    ) {
      this.entries = this.entries.filter(
        (entry) => entry.description !== 'Monthly Budget Entry'
      );
      this.openMonthlyBudgetWindow();
    } else {
      this.entries = this.entries.filter((entry) => entry.id !== id);
      localStorage.removeItem(id.toString());
    }
  }

  openEntryWindow() {
    this.showEntryWindow = true;
    this.resetEntryForm();
  }

  closeEntryWindow() {
    this.showEntryWindow = false;
    this.resetEntryForm();
  }

  openMonthlyBudgetWindow() {
    this.showMonthlyBudgetWindow = true;
    this.resetEntryForm();
  }

  closeMonthlyBudgetWindow() {
    this.showMonthlyBudgetWindow = false;
    this.resetMonthlyBudgetForm();
  }

  addEntry() {
    if (!this.entryForm.valid) return;

    const newEntry: BudgetEntry = {
      id: this.entries.length,
      description: this.entryForm.get('description')?.value ?? '',
      amount: this.entryForm.get('amount')?.value ?? 0,
      type: this.entryForm.get('type')?.value ?? 'income',
      interval: this.entryForm.get('interval')?.value ?? 'one-time',
      date: new Date(),
    };

    this.entries.unshift(newEntry);
    localStorage.setItem(newEntry.id.toString(), JSON.stringify(newEntry));
    this.closeEntryWindow();
  }

  addMonthlyBudgetEntry() {
    if (!this.monthlyBudgetForm.valid) return;
    this.entries = this.entries.filter(
      (entry) => entry.description !== 'Monthly Budget Entry'
    );

    const newEntry: BudgetEntry = {
      id: this.entries.length,
      description: 'Monthly Budget Entry',
      amount: this.monthlyBudgetForm.get('amount')?.value ?? 0,
      type: 'income',
      interval: 'monthly',
      date: new Date(),
    };

    this.entries.unshift(newEntry);
    localStorage.setItem(newEntry.id.toString(), JSON.stringify(newEntry));
    this.closeMonthlyBudgetWindow();
  }

  resetEntryForm() {
    this.entryForm.reset({
      amount: null,
      type: 'income',
      description: '',
      interval: 'one-time',
    });
  }

  resetMonthlyBudgetForm() {
    this.monthlyBudgetForm.reset({
      amount: null,
    });
  }

  getIntervalLabel(interval: string): string {
    switch (interval) {
      case 'one-time':
        return 'One-time';
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      default:
        return 'One-time';
    }
  }

  getTotalIncome(): number {
    return this.entries
      .filter((entry) => entry.type === 'income')
      .reduce((sum, entry) => sum + entry.amount, 0);
  }

  getTotalExpenses(): number {
    return this.entries
      .filter((entry) => entry.type === 'expense')
      .reduce((sum, entry) => sum + entry.amount, 0);
  }

  getBalance(): number {
    return this.getTotalIncome() - this.getTotalExpenses();
  }
}
