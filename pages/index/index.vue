<template>
    <div>
        <TreasuryManagement />
        <div class="fixed bottom-6 right-6">
            <nuxt-link 
                to="/about" 
                class="inline-flex items-center px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium shadow-lg"
            >
                Go to About Page
            </nuxt-link>
        </div>
    </div>
</template>

<script>
import TreasuryManagement from '~/components/TreasuryManagement.vue';

export default {
    components: {
        TreasuryManagement
    }
};
</script>

<style scoped>

</style>