import { useMutation } from "@tanstack/react-query";
import { apiClient } from "./api";

export const useLivekitToken = () => {
    return useMutation({
        mutationKey: ['auth'],
        mutationFn: async () => {
            const res = await apiClient.auth.post({
                identity: "test",

            });
            if (res.error) {
                switch (res.error.status) {
                    case 422:
                        throw new Error(res.error.value.message);
                    default:
                        throw new Error("An unknown error occurred");
                }
            }
            return res.data;
        },
    });
};