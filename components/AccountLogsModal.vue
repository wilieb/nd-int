<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
      <div class="p-6 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold text-slate-800">Account Logs</h2>
          <p class="text-sm text-slate-600">{{ account?.name }} ({{ account?.currency }})</p>
        </div>
        <button
          @click="$emit('close')"
          class="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div class="p-6">
        <div class="flex items-center space-x-4 mb-4">
          <select 
            v-model="statusFilter" 
            @change="fetchLogs"
            class="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="scheduled">Scheduled</option>
          </select>
          
          <div class="flex items-center space-x-2 text-sm text-slate-600">
            <span>{{ logs.length }} entries</span>
          </div>
        </div>
        
        <div class="overflow-x-auto max-h-96">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 sticky top-0">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Action</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Related Account</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Balance</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr v-if="logs.length === 0">
                <td colspan="6" class="px-4 py-8 text-center text-slate-500">
                  No logs found
                </td>
              </tr>
              <tr v-for="log in logs" :key="log.id" class="hover:bg-slate-50">
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
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  show: Boolean,
  account: Object
})

const emit = defineEmits(['close'])

const logs = ref([])
const statusFilter = ref('')

const fetchLogs = async () => {
  if (!props.account?.id) return
  
  try {
    const query = statusFilter.value ? `?status=${statusFilter.value}` : ''
    const { data } = await $fetch(`/api/account-logs/${props.account.id}${query}`)
    logs.value = data.data
  } catch (error) {
    console.error('Failed to fetch logs:', error)
  }
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    fetchLogs()
  }
})

const formatDate = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatAmount = (amount, currency) => {
  const symbols = { KES: 'KSh', USD: '$', NGN: '₦' }
  return `${symbols[currency]} ${amount?.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`
}

const getActionClass = (action) => {
  return action === 'debit' 
    ? 'px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full'
    : 'px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full'
}

const getStatusClass = (status) => {
  const classes = {
    completed: 'px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full',
    failed: 'px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full',
    scheduled: 'px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full'
  }
  return classes[status] || 'px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full'
}
</script>