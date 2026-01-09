import useSWR from 'swr';
import { HomepageData } from '@/types/homepage';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useHomepageData() {
    const { data, error, isLoading } = useSWR<HomepageData>('/api/homepage', fetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false, // Don't aggressively revalidate for static content
        keepPreviousData: true,
    });

    return {
        data,
        isLoading,
        isError: error,
    };
}
