<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-800 mb-2">Treasury Management</h1>
        <p class="text-slate-600">Manage virtual accounts across multiple currencies with FX support</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div 
          v-for="currency in ['KES', 'USD', 'NGN']"
          :key="currency"
          class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 cursor-pointer transition-all duration-200 hover:shadow-md"
          :class="selectedCurrencyFilter === currency ? currencyClassMap[currency] : ''"
          @click="toggleCurrencyFilter(currency)"
        >
          <div class="flex items-center justify-between">
            <div>
              <div class="flex items-center space-x-2 mb-1">
                <p class="text-sm font-medium text-slate-600">Total {{ currency }}</p>
                <div v-if="selectedCurrencyFilter === currency" :class="currencyClassMapActive[currency]"></div>
              </div>
              <p class="text-2xl font-bold" :class="getCurrencyColorClass(currency)">
                {{ formatAmount(getTotalByCurrency(currency), currency) }}
              </p>
              <p class="text-xs text-slate-500 mt-1">{{ getAccountCountByCurrency(currency) }} accounts</p>
            </div>
            <div class="w-12 h-12 rounded-lg flex items-center justify-center" :class="getCurrencyBgClass(currency)">
              <span class="font-bold text-lg" :class="getCurrencyColorClass(currency)">
                {{ getCurrencySymbol(currency) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="selectedCurrencyFilter" class="mb-6">
        <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-slate-800">Filtering by {{ selectedCurrencyFilter }}</p>
                <p class="text-xs text-slate-500">Showing {{ selectedCurrencyFilter }} accounts and transactions only</p>
              </div>
            </div>
            <button 
              @click="clearFilter"
              class="text-slate-400 hover:text-slate-600 transition-colors"
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
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-semibold text-slate-800">Virtual Accounts</h2>
                <button
                  v-if="showAccountLogs"
                  @click="showAccountLogs = false"
                  class="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  ← Back to Accounts
                </button>
              </div>
            </div>
            
            <div v-if="showAccountLogs && selectedAccount" class="p-6">
              <div class="mb-6">
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <h3 class="text-lg font-semibold text-slate-800">{{ selectedAccount.name }}</h3>
                    <p class="text-sm text-slate-600">
                      Balance: {{ formatAmount(selectedAccount.balance, selectedAccount.currency) }}
                    </p>
                  </div>
                  <div class="flex items-center space-x-3">
                    <select 
                      v-model="logStatusFilter" 
                      @change="fetchAccountLogs"
                      class="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="">All Status</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                    <span class="text-sm text-slate-500">{{ accountLogs.length }} entries</span>
                  </div>
                </div>
              </div>
              
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="bg-slate-50">
                    <tr>
                      <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Action</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Related Account</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Balance After</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-200">
                    <tr v-if="accountLogs.length === 0">
                      <td colspan="6" class="px-4 py-8 text-center text-slate-500">
                        No logs found
                      </td>
                    </tr>
                    <tr v-for="log in accountLogs" :key="log.id" class="hover:bg-slate-50">
                      <td class="px-4 py-3 text-slate-900">
                        {{ formatDate(log.created_at) }}
                      </td>
                      <td class="px-4 py-3">
                        <span :class="getActionClass(log.action)">
                          {{ log.action.toUpperCase() }}
                        </span>
                      </td>
                      <td class="px-4 py-3 font-medium text-slate-900">
                        {{ formatAmount(log.amount, log.currency) }}
                      </td>
                      <td class="px-4 py-3 text-slate-600">
                        {{ log.related_account || '-' }}
                      </td>
                      <td class="px-4 py-3 text-slate-900">
                        {{ formatAmount(log.balance_after, log.currency) }}
                      </td>
                      <td class="px-4 py-3">
                        <span :class="getStatusClass(log.status)">
                          {{ log.status }}
                        </span>
                        <div v-if="log.error_message" class="text-xs text-red-600 mt-1">
                          {{ log.error_message }}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div v-else class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  v-for="account in filteredAccounts" 
                  :key="account.id"
                  class="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors cursor-pointer group"
                  :class="selectedAccount?.id === account.id ? currencyClassMapActiveTwo[account.currency] : ''"
                  @click="selectAccount(account)"
                >
                  <div class="flex items-center justify-between mb-2">
                    <h3 class="font-medium text-slate-800">{{ account.name }}</h3>
                    <div class="flex items-center space-x-2">
                      <span 
                        class="px-2 py-1 text-xs font-medium rounded-full"
                        :class="getCurrencyBadgeClass(account.currency)"
                      >
                        {{ account.currency }}
                      </span>
                      <button
                        @click.stop="viewAccountLogs(account)"
                        class="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition-all"
                        title="View logs"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p class="text-2xl font-bold" :class="getCurrencyColorClass(account.currency)">
                    {{ formatAmount(account.balance, account.currency) }}
                  </p>
                  <p class="text-xs text-slate-500 mt-1">Created {{ formatDate(account.created_at) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 sticky top-6">
            <div class="p-6 border-b border-slate-200">
              <h2 class="text-xl font-semibold text-slate-800">New Transfer</h2>
            </div>
            <form @submit.prevent="submitTransfer" class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">From Account</label>
                <select 
                  v-model="transfer.fromAccountId" 
                  @change="updateExchangeInfo"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                >
                  <option value="">Select source account</option>
                  <option 
                    v-for="account in accounts" 
                    :key="account.id" 
                    :value="account.id"
                  >
                    {{ account.name }} - {{ formatAmount(account.balance, account.currency) }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">To Account</label>
                <select 
                  v-model="transfer.toAccountId" 
                  @change="updateExchangeInfo"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                >
                  <option value="">Select destination account</option>
                  <option 
                    v-for="account in accounts.filter(a => a.id !== transfer.fromAccountId)" 
                    :key="account.id" 
                    :value="account.id"
                  >
                    {{ account.name }} - {{ formatAmount(account.balance, account.currency) }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Amount</label>
                <div class="relative">
                  <input 
                    v-model.number="transfer.amount" 
                    type="number" 
                    step="0.01" 
                    min="0.01"
                    class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="0.00"
                    required
                  />
                  <div v-if="fromAccount" class="absolute right-3 top-2 text-sm text-slate-500">
                    {{ fromAccount.currency }}
                  </div>
                </div>
              </div>

              <div v-if="exchangeInfo.isRequired" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div class="flex items-start space-x-2">
                  <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div class="text-sm">
                    <p class="font-medium text-blue-800 mb-1">Currency Conversion</p>
                    <div class="text-blue-700 space-y-1">
                      <p>Rate: 1 {{ exchangeInfo.fromCurrency }} = {{ exchangeInfo.rate }} {{ exchangeInfo.toCurrency }}</p>
                      <p class="font-medium">
                        {{ formatAmount(transfer.amount || 0, exchangeInfo.fromCurrency) }} → 
                        {{ formatAmount((transfer.amount || 0) * exchangeInfo.rate, exchangeInfo.toCurrency) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Note (Optional)</label>
                <textarea 
                  v-model="transfer.note" 
                  rows="2"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Transfer description..."
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Schedule Transfer (Optional)</label>
                <input 
                  v-model="transfer.scheduledDate" 
                  type="datetime-local" 
                  :min="minDateTime"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <p class="text-xs text-slate-500 mt-1">Leave empty for immediate transfer</p>
              </div>

              <button 
                type="submit" 
                :disabled="loading || !canSubmit"
                class="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {{ loading ? 'Processing...' : (transfer.scheduledDate ? 'Schedule Transfer' : 'Transfer Now') }}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div v-show="activeTab === 'history'" class="bg-white rounded-xl shadow-sm border border-slate-200">
        <div class="p-6 border-b border-slate-200">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-slate-800">Transaction History</h2>
            <div class="flex items-center space-x-4">
              <select 
                v-model="historyFilter" 
                @change="fetchTransactions"
                class="px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="">All Accounts</option>
                <option 
                  v-for="account in accounts" 
                  :key="account.id" 
                  :value="account.id"
                >
                  {{ account.name }}
                </option>
              </select>
              <button 
                @click="fetchTransactions" 
                class="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
        
        <div class="p-6">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">From</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">To</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Note</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                <tr v-if="transactions.length === 0">
                  <td colspan="6" class="px-4 py-8 text-center text-slate-500">
                    No transactions found
                  </td>
                </tr>
                <tr v-for="transaction in transactions" :key="transaction.id" class="hover:bg-slate-50">
                  <td class="px-4 py-3 text-slate-900">
                    {{ formatDate(transaction.created_at) }}
                  </td>
                  <td class="px-4 py-3">
                    <div class="text-slate-900">{{ transaction.from_account_name }}</div>
                    <div class="text-xs text-slate-500">{{ transaction.from_currency }}</div>
                  </td>
                  <td class="px-4 py-3">
                    <div class="text-slate-900">{{ transaction.to_account_name }}</div>
                    <div class="text-xs text-slate-500">{{ transaction.to_currency }}</div>
                  </td>
                  <td class="px-4 py-3">
                    <div class="font-medium text-slate-900">
                      {{ formatAmount(transaction.original_amount || transaction.amount, transaction.from_currency) }}
                    </div>
                    <div v-if="transaction.exchange_rate !== 1" class="text-xs text-slate-500">
                      → {{ formatAmount(transaction.amount, transaction.to_currency) }}
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <span :class="getStatusClass(transaction.status)">
                      {{ transaction.status }}
                    </span>
                    <div v-if="transaction.scheduled_date && transaction.status === 'scheduled'" class="text-xs text-slate-500 mt-1">
                      Scheduled: {{ formatDate(transaction.scheduled_date) }}
                    </div>
                  </td>
                  <td class="px-4 py-3 text-slate-600 max-w-xs truncate">
                    {{ transaction.note || '-' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div 
        v-if="message.text" 
        :class="[
          'fixed top-4 right-4 p-4 rounded-lg shadow-lg max-w-md z-50 transition-all duration-300',
          message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
        ]"
      >
        <div class="flex items-start space-x-2">
          <svg 
            v-if="message.type === 'success'" 
            class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg 
            v-else 
            class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="flex-1">
            <p class="font-medium">{{ message.text }}</p>
            <div v-if="message.details" class="text-sm mt-1">
              <div v-for="detail in message.details" :key="detail">{{ detail }}</div>
            </div>
          </div>
          <button 
            @click="clearMessage" 
            class="text-current opacity-70 hover:opacity-100"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: 'Treasury Management',
  meta: [
    { name: 'description', content: 'Manage virtual accounts across multiple currencies with FX support' }
  ]
})

const activeTab = ref('accounts')
const accounts = ref([])
const transactions = ref([])
const exchangeRates = ref([])
const selectedAccount = ref(null)
const selectedCurrencyFilter = ref('')
const loading = ref(false)
const showAccountLogs = ref(false)
const accountLogs = ref([])
const logStatusFilter = ref('')
const historyFilter = ref('')

const transfer = ref({
  fromAccountId: '',
  toAccountId: '',
  amount: null,
  note: '',
  scheduledDate: ''
});

const currencyClassMap = {
  KES: 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50',
  USD: 'ring-2 ring-blue-500 border-blue-500 bg-blue-50',
  NGN: 'ring-2 ring-purple-500 border-purple-500 bg-purple-50',
}

const currencyClassMapActive = {
  KES: 'w-2 h-2 bg-emerald-500 rounded-full',
  USD: 'w-2 h-2 bg-blue-500 rounded-full',
  NGN: 'w-2 h-2 bg-purple-500 rounded-full',
}

const currencyClassMapActiveTwo = {
  KES: 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50',
  USD: 'ring-2 ring-blue-500 border-blue-500 bg-blue-50',
  NGN: 'ring-2 ring-purple-500 border-purple-500 bg-purple-50',
}

const exchangeInfo = ref({
  isRequired: false,
  rate: 1,
  fromCurrency: '',
  toCurrency: ''
})

const message = ref({
  text: '',
  type: 'success',
  details: []
})

const filteredAccounts = computed(() => {
  if (!selectedCurrencyFilter.value) return accounts.value
  return accounts.value.filter(account => account.currency === selectedCurrencyFilter.value)
})

const fromAccount = computed(() => {
  return accounts.value.find(a => a.id == transfer.value.fromAccountId)
})

const toAccount = computed(() => {
  return accounts.value.find(a => a.id == transfer.value.toAccountId)
})

const canSubmit = computed(() => {
  return transfer.value.fromAccountId && 
         transfer.value.toAccountId && 
         transfer.value.amount > 0 &&
         transfer.value.fromAccountId !== transfer.value.toAccountId
})

const minDateTime = computed(() => {
  const now = new Date()
  now.setMinutes(now.getMinutes() + 1) 
  return now.toISOString().slice(0, 16)
})

const fetchAccounts = async () => {
  try {
    const { data } = await $fetch('/api/accounts')
    
    accounts.value = data
  } catch (error) {
    showMessage('Failed to fetch accounts', 'error')
  }
}

const fetchTransactions = async () => {
  try {
    const query = new URLSearchParams()
    if (selectedCurrencyFilter.value) {
      query.append('currency', selectedCurrencyFilter.value)
    }
    if (historyFilter.value) {
      query.append('account_id', historyFilter.value)
    }
    
    const { data } = await $fetch(`/api/transactions?${query.toString()}`)
    transactions.value = data
  } catch (error) {
    showMessage('Failed to fetch transactions', 'error')
  }
}

const fetchExchangeRates = async () => {
  try {
    const { data } = await $fetch('/api/exchange-rates')
    exchangeRates.value = data
  } catch (error) {
    showMessage('Failed to fetch exchange rates', 'error')
  }
}

const fetchAccountLogs = async () => {
  if (!selectedAccount.value) return
  
  try {
    // const query = new URLSearchParams()
    // query.append('account_id', selectedAccount.value.id)
    // if (logStatusFilter.value) {
    //   query.append('status', logStatusFilter.value)
    // }
    
    const { data } = await $fetch(`/api/account-logs/${selectedAccount.value.id}`)
    accountLogs.value = data
  } catch (error) {
    showMessage('Failed to fetch account logs', 'error')
  }
}

const submitTransfer = async () => {
  if (!canSubmit.value) return
  
  loading.value = true
  try {
    const payload = {
      fromAccountId: transfer.value.fromAccountId,
      toAccountId: transfer.value.toAccountId,
      amount: transfer.value.amount,
      note: transfer.value.note || null,
      scheduledDate: transfer.value.scheduledDate || null
    }
    
    const { data } = await $fetch('/api/transactions', {
      method: 'POST',
      body: payload
    })
    
    showMessage(
      transfer.value.scheduledDate ? 'Transfer scheduled successfully' : 'Transfer completed successfully',
      'success'
    )
    
    transfer.value = {
      fromAccountId: '',
      toAccountId: '',
      amount: null,
      note: '',
      scheduledDate: ''
    }
    
    await Promise.all([
      fetchAccounts(),
      fetchTransactions()
    ])
    
  } catch (error) {
    const errorMessage = error.data?.message || 'Transfer failed'
    const errorDetails = error.data?.errors || []
    showMessage(errorMessage, 'error', errorDetails)
  } finally {
    loading.value = false
  }
}

const updateExchangeInfo = () => {
  if (!fromAccount.value || !toAccount.value) {
    exchangeInfo.value = {
      isRequired: false,
      rate: 1,
      fromCurrency: '',
      toCurrency: ''
    }
    return
  }
  
  const fromCurrency = fromAccount.value.currency
  const toCurrency = toAccount.value.currency
  
  if (fromCurrency === toCurrency) {
    exchangeInfo.value = {
      isRequired: false,
      rate: 1,
      fromCurrency,
      toCurrency
    }
    return
  }
  
  const rate = findExchangeRate(fromCurrency, toCurrency)
  exchangeInfo.value = {
    isRequired: true,
    rate,
    fromCurrency,
    toCurrency
  }
}

const findExchangeRate = (fromCurrency, toCurrency) => {
  const directRate = exchangeRates.value.find(
    rate => rate.from_currency === fromCurrency && rate.to_currency === toCurrency
  )
  
  if (directRate) {
    return directRate.rate
  }
  
  const inverseRate = exchangeRates.value.find(
    rate => rate.from_currency === toCurrency && rate.to_currency === fromCurrency
  )
  
  if (inverseRate) {
    return 1 / inverseRate.rate
  }
  
  const fallbackRates = {
    'USD_KES': 130.00,
    'USD_NGN': 750.00,
    'KES_NGN': 5.77
  }
  
  const rateKey = `${fromCurrency}_${toCurrency}`
  const inverseKey = `${toCurrency}_${fromCurrency}`
  
  if (fallbackRates[rateKey]) {
    return fallbackRates[rateKey]
  }
  
  if (fallbackRates[inverseKey]) {
    return 1 / fallbackRates[inverseKey]
  }
  
  return 1 
}

const selectAccount = (account) => {
  selectedAccount.value = selectedAccount.value?.id === account.id ? null : account
}

const viewAccountLogs = async (account) => {
  selectedAccount.value = account
  showAccountLogs.value = true
  await fetchAccountLogs()
}

const toggleCurrencyFilter = (currency) => {
  selectedCurrencyFilter.value = selectedCurrencyFilter.value === currency ? '' : currency
}

const clearFilter = () => {
  selectedCurrencyFilter.value = ''
}

const showMessage = (text, type = 'success', details = []) => {
  message.value = { text, type, details }
  setTimeout(() => {
    clearMessage()
  }, 5000)
}

const clearMessage = () => {
  message.value = { text: '', type: 'success', details: [] }
}

const formatAmount = (amount, currency) => {
  const formatters = {
    'KES': new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }),
    'USD': new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
    'NGN': new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' })
  }
  
  const formatter = formatters[currency] || formatters['USD']
  return formatter.format(amount || 0)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const getCurrencySymbol = (currency) => {
  const symbols = {
    'KES': 'KSh',
    'USD': '$',
    'NGN': '₦'
  }
  return symbols[currency] || currency
}

const getCurrencyColorClass = (currency) => {
  const colors = {
    'KES': 'text-green-600',
    'USD': 'text-blue-600',
    'NGN': 'text-purple-600'
  }
  return colors[currency] || 'text-slate-600'
}

const getCurrencyBgClass = (currency) => {
  const colors = {
    'KES': 'bg-green-100',
    'USD': 'bg-blue-100',
    'NGN': 'bg-purple-100'
  }
  return colors[currency] || 'bg-slate-100'
}

const getCurrencyBadgeClass = (currency) => {
  const colors = {
    'KES': 'bg-green-100 text-green-800',
    'USD': 'bg-blue-100 text-blue-800',
    'NGN': 'bg-purple-100 text-purple-800'
  }
  return colors[currency] || 'bg-slate-100 text-slate-800'
}

const getStatusClass = (status) => {
  const classes = {
    'completed': 'px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800',
    'failed': 'px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800',
    'scheduled': 'px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800',
    'processing': 'px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800'
  }
  return classes[status] || 'px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-800'
}

const getActionClass = (action) => {
  const classes = {
    'credit': 'px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800',
    'debit': 'px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800',
    'transfer_in': 'px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800',
    'transfer_out': 'px-2 py-1 text-xs font-medium rounded bg-orange-100 text-orange-800'
  }
  return classes[action] || 'px-2 py-1 text-xs font-medium rounded bg-slate-100 text-slate-800'
}

const getTotalByCurrency = (currency) => {
  return accounts.value
    .filter(account => account.currency === currency)
    .reduce((sum, account) => sum + (account.balance || 0), 0)
}

const getAccountCountByCurrency = (currency) => {
  return accounts.value.filter(account => account.currency === currency).length
}

onMounted(async () => {
  await Promise.all([
    fetchAccounts(),
    fetchTransactions(),
    fetchExchangeRates()
  ])
})

watch([() => transfer.value.fromAccountId, () => transfer.value.toAccountId], () => {
  updateExchangeInfo()
})

watch(selectedCurrencyFilter, () => {
  fetchTransactions()
})
</script>