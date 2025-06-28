<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-800 mb-2">Treasury Management</h1>
        <p class="text-slate-600">Manage virtual accounts across multiple currencies</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div 
          class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 cursor-pointer transition-all duration-200 hover:shadow-md"
          :class="{ 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50': selectedCountryFilter === 'Kenya' }"
          @click="toggleCountryFilter('Kenya')"
        >
          <div class="flex items-center justify-between">
            <div>
              <div class="flex items-center space-x-2 mb-1">
                <p class="text-sm font-medium text-slate-600">Total KES</p>
                <div v-if="selectedCountryFilter === 'Kenya'" class="w-2 h-2 bg-emerald-500 rounded-full"></div>
              </div>
              <p class="text-2xl font-bold text-emerald-600">{{ formatAmount(getTotalByCurrency('KES'), 'KES') }}</p>
              <p class="text-xs text-slate-500 mt-1">Kenya • {{ getAccountCountByCurrency('KES') }} accounts</p>
            </div>
            <div class="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <span class="text-emerald-600 font-bold text-lg">K</span>
            </div>
          </div>
        </div>
        
        <div 
          class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 cursor-pointer transition-all duration-200 hover:shadow-md"
          :class="{ 'ring-2 ring-blue-500 border-blue-500 bg-blue-50': selectedCountryFilter === 'USA' }"
          @click="toggleCountryFilter('USA')"
        >
          <div class="flex items-center justify-between">
            <div>
              <div class="flex items-center space-x-2 mb-1">
                <p class="text-sm font-medium text-slate-600">Total USD</p>
                <div v-if="selectedCountryFilter === 'USA'" class="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
              <p class="text-2xl font-bold text-blue-600">{{ formatAmount(getTotalByCurrency('USD'), 'USD') }}</p>
              <p class="text-xs text-slate-500 mt-1">USA • {{ getAccountCountByCurrency('USD') }} accounts</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span class="text-blue-600 font-bold text-lg">$</span>
            </div>
          </div>
        </div>
        
        <div 
          class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 cursor-pointer transition-all duration-200 hover:shadow-md"
          :class="{ 'ring-2 ring-purple-500 border-purple-500 bg-purple-50': selectedCountryFilter === 'Nigeria' }"
          @click="toggleCountryFilter('Nigeria')"
        >
          <div class="flex items-center justify-between">
            <div>
              <div class="flex items-center space-x-2 mb-1">
                <p class="text-sm font-medium text-slate-600">Total NGN</p>
                <div v-if="selectedCountryFilter === 'Nigeria'" class="w-2 h-2 bg-purple-500 rounded-full"></div>
              </div>
              <p class="text-2xl font-bold text-purple-600">{{ formatAmount(getTotalByCurrency('NGN'), 'NGN') }}</p>
              <p class="text-xs text-slate-500 mt-1">Nigeria • {{ getAccountCountByCurrency('NGN') }} accounts</p>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span class="text-purple-600 font-bold text-lg">₦</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="selectedCountryFilter" class="mb-6">
        <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-slate-800">Filtering by {{ selectedCountryFilter }}</p>
                <p class="text-xs text-slate-500">Showing {{ getCurrencyByCountry(selectedCountryFilter) }} accounts and transactions only</p>
              </div>
            </div>
            <button 
              @click="clearFilter"
              class="text-slate-400 hover:text-slate-600 transition-colors"
              title="Clear filter"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 mb-8">
        <div class="p-4">
          <nav class="flex space-x-1 bg-slate-100 p-1 rounded-lg">
            <button
              @click="activeTab = 'accounts'"
              :class="[
                'flex-1 px-6 py-3 text-sm font-medium rounded-md transition-all duration-200',
                activeTab === 'accounts' 
                  ? 'bg-white text-emerald-600 shadow-sm border border-slate-200' 
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              ]"
            >
              <div class="flex items-center justify-center space-x-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span>Accounts & Transfers</span>
              </div>
            </button>
            <button
              @click="activeTab = 'history'"
              :class="[
                'flex-1 px-6 py-3 text-sm font-medium rounded-md',
                activeTab === 'history' 
                  ? 'bg-white text-emerald-600 shadow-sm border border-slate-200' 
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              ]"
            >
              <div class="flex items-center justify-center space-x-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Transaction History</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      <div v-show="activeTab === 'accounts'" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2">
          <div class="bg-white rounded-xl shadow-sm border border-slate-200">
            <div class="p-6 border-b border-slate-200">
              <h2 class="text-xl font-semibold text-slate-800">Virtual Accounts</h2>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  v-for="account in filteredAccounts" 
                  :key="account.id"
                  class="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors cursor-pointer"
                  :class="{ 'ring-2 ring-[#004F44] border-[#004F44]': selectedAccount?.id === account.id }"
                  @click="selectAccount(account)"
                >
                  <div class="flex items-center justify-between mb-2">
                    <h3 class="font-medium text-slate-800">{{ account.name }}</h3>
                    <span 
                      class="px-2 py-1 text-xs font-medium rounded-full"
                      :class="getCurrencyBadgeClass(account.currency)"
                    >
                      {{ account.currency }}
                    </span>
                  </div>
                  <!-- <p class="text-2xl font-bold" :class="getCurrencyTextClass(account.currency)"> -->
                  <p class="text-xl font-semibold text-[#001d13]">
                    {{ formatAmount(account.balance, account.currency) }}
                  </p>
                </div>
              </div>
              
              <div v-if="filteredAccounts.length === 0" class="text-center py-12">
                <div class="flex flex-col items-center justify-center text-slate-500">
                  <svg class="w-12 h-12 mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p class="text-lg font-medium mb-1">No accounts found</p>
                  <p class="text-sm">No accounts match the current filter</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-sm border border-slate-200">
            <div class="p-6 border-b border-slate-200">
              <h2 class="text-xl font-semibold text-slate-800">Transfer Funds</h2>
            </div>
            <div class="p-6">
              <form @submit.prevent="processTransfer" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">From Account</label>
                  <select 
                    v-model="transfer.fromAccountId" 
                    class="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  >
                    <option value="">Select source account</option>
                    <option v-for="account in filteredAccountsForTransfer" :key="account.id" :value="account.id">
                      {{ account.name }} ({{ formatAmount(account.balance, account.currency) }})
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">To Account</label>
                  <select 
                    v-model="transfer.toAccountId" 
                    class="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  >
                    <option value="" class="mx-2">Select destination account</option>
                    <option 
                      v-for="account in availableDestinationAccounts" 
                      :key="account.id" 
                      :value="account.id"
                      class="mx-2"
                    >
                      {{ account.name }} ({{ account.currency }})
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Amount</label>
                  <input 
                    v-model.number="transfer.amount" 
                    type="number" 
                    step="0.01" 
                    min="0.01"
                    class="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="0.00"
                    required
                  />
                  <p v-if="transfer.fromAccountId && getSourceAccount()" class="text-xs text-slate-500 mt-1">
                    Available: {{ formatAmount(getSourceAccount().balance, getSourceAccount().currency) }}
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">Note (Optional)</label>
                  <textarea 
                    v-model="transfer.note" 
                    class="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    rows="3"
                    placeholder="Transfer description..."
                  ></textarea>
                </div>

                <div v-if="transferError" class="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p class="text-sm text-red-600">{{ transferError }}</p>
                </div>

                <button 
                  type="submit" 
                  class="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="!canTransfer"
                >
                  Transfer Funds
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div v-show="activeTab === 'history'">
        <div class="bg-white rounded-xl shadow-sm border border-slate-200">
          <div class="p-6 border-b border-slate-200">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold text-slate-800">Transaction History</h2>
              <div class="flex items-center space-x-2 text-sm text-slate-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>{{ filteredTransactions.length }} transactions</span>
              </div>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-slate-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">From</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">To</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Note</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-slate-200">
                <tr v-if="filteredTransactions.length === 0">
                  <td colspan="5" class="px-6 py-8 text-center">
                    <div class="flex flex-col items-center justify-center text-slate-500">
                      <svg class="w-12 h-12 mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p class="text-lg font-medium mb-1">{{ selectedCountryFilter ? 'No transactions found' : 'No transactions yet' }}</p>
                      <p class="text-sm">{{ selectedCountryFilter ? `No transactions found for ${selectedCountryFilter}` : 'Transfer funds between accounts to see transaction history' }}</p>
                    </div>
                  </td>
                </tr>
                <tr v-for="transaction in filteredTransactions" :key="transaction.id" class="hover:bg-slate-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {{ formatDate(transaction.date) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {{ getAccountName(transaction.fromAccountId) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {{ getAccountName(transaction.toAccountId) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {{ formatAmount(transaction.amount, transaction.currency) }}
                  </td>
                  <td class="px-6 py-4 text-sm text-slate-500">
                    {{ transaction.note || '-' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TreasuryManagement',
  data() {
    return {
      activeTab: 'accounts',
      selectedCountryFilter: null,
      selectedAccount: null,
      transferError: '',
      transfer: {
        fromAccountId: '',
        toAccountId: '',
        amount: 0,
        note: ''
      },
      accounts: [
        { id: 1, name: 'Mpesa_KES_1', currency: 'KES', balance: 250000.50 },
        { id: 2, name: 'Mpesa_KES_2', currency: 'KES', balance: 180000.00 },
        { id: 3, name: 'Bank_KES_1', currency: 'KES', balance: 500000.75 },
        { id: 4, name: 'Bank_USD_1', currency: 'USD', balance: 15000.25 },
        { id: 5, name: 'Bank_USD_2', currency: 'USD', balance: 32000.00 },
        { id: 6, name: 'Bank_USD_3', currency: 'USD', balance: 8750.50 },
        { id: 7, name: 'Paystack_NGN_1', currency: 'NGN', balance: 2500000.00 },
        { id: 8, name: 'Paystack_NGN_2', currency: 'NGN', balance: 1800000.25 },
        { id: 9, name: 'Bank_NGN_1', currency: 'NGN', balance: 5000000.50 },
        { id: 10, name: 'Bank_NGN_2', currency: 'NGN', balance: 3200000.75 }
      ],
      transactions: []
    };
  },
  computed: {
    filteredAccounts() {
      if (!this.selectedCountryFilter) return this.accounts;
      const currency = this.getCurrencyByCountry(this.selectedCountryFilter);
      return this.accounts.filter(account => account.currency === currency);
    },
    
    filteredAccountsForTransfer() {
      return this.filteredAccounts;
    },
    
    filteredTransactions() {
      if (!this.selectedCountryFilter) return this.transactions;
      const currency = this.getCurrencyByCountry(this.selectedCountryFilter);
      return this.transactions.filter(transaction => transaction.currency === currency);
    },
    
    availableDestinationAccounts() {
      return this.filteredAccountsForTransfer.filter(account => account.id !== this.transfer.fromAccountId);
    },
    canTransfer() {
      return this.transfer.fromAccountId && 
             this.transfer.toAccountId && 
             this.transfer.amount > 0 &&
             this.isValidTransfer();
    }
  },
  methods: {
    selectAccount(account) {
      this.selectedAccount = account;
    },

    toggleCountryFilter(country) {
      if (this.selectedCountryFilter === country) {
        this.selectedCountryFilter = null;
      } else {
        this.selectedCountryFilter = country;
      }
    },

    getCurrencyByCountry(country) {
      const countryToCurrency = {
        'Kenya': 'KES',
        'USA': 'USD', 
        'Nigeria': 'NGN'
      };
      return countryToCurrency[country] || '';
    },
    
    clearFilter() {
      this.selectedCountryFilter = null;
    },
    
    getSourceAccount() {
      return this.accounts.find(acc => acc.id === this.transfer.fromAccountId);
    },
    
    getAccountName(accountId) {
      const account = this.accounts.find(acc => acc.id === accountId);
      return account ? account.name : 'Unknown';
    },
    
    getTotalByCurrency(currency) {
      return this.accounts
        .filter(acc => acc.currency === currency)
        .reduce((total, acc) => total + acc.balance, 0);
    },

    getAccountCountByCurrency(currency) {
      return this.accounts.filter(acc => acc.currency === currency).length;
    },
    
    isValidTransfer() {
      const sourceAccount = this.getSourceAccount();
      if (!sourceAccount) return false;
      
      const destinationAccount = this.accounts.find(acc => acc.id === this.transfer.toAccountId);
      if (!destinationAccount) return false;
      
      if (sourceAccount.currency !== destinationAccount.currency) {
        this.transferError = 'Cannot transfer between different currencies';
        return false;
      }
      
      if (this.transfer.amount > sourceAccount.balance) {
        this.transferError = 'Insufficient balance';
        return false;
      }
      
      this.transferError = '';
      return true;
    },
    
    processTransfer() {
      if (!this.canTransfer) return;
      
      const sourceAccount = this.getSourceAccount();
      const destinationAccount = this.accounts.find(acc => acc.id === this.transfer.toAccountId);
      
      sourceAccount.balance -= this.transfer.amount;
      destinationAccount.balance += this.transfer.amount;
      
      const transaction = {
        id: this.transactions.length + 1,
        fromAccountId: this.transfer.fromAccountId,
        toAccountId: this.transfer.toAccountId,
        amount: this.transfer.amount,
        currency: sourceAccount.currency,
        note: this.transfer.note,
        date: new Date()
      };
      
      this.transactions.unshift(transaction);
      
      this.transfer = {
        fromAccountId: '',
        toAccountId: '',
        amount: 0,
        note: ''
      };
      
      this.transferError = '';
    },
    
    formatAmount(amount, currency) {
      const symbols = { KES: 'KSh', USD: '$', NGN: '₦' };
      return `${symbols[currency]} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },
    
    formatDate(date) {
      return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    getCurrencyBadgeClass(currency) {
      const classes = {
        KES: 'bg-emerald-100 text-emerald-800',
        USD: 'bg-blue-100 text-blue-800',
        NGN: 'bg-purple-100 text-purple-800'
      };
      return classes[currency] || 'bg-gray-100 text-gray-800';
    },
    
    getCurrencyTextClass(currency) {
      const classes = {
        KES: 'text-emerald-600',
        USD: 'text-blue-600',
        NGN: 'text-purple-600'
      };
      return classes[currency] || 'text-gray-600';
    }
  }
}
</script>