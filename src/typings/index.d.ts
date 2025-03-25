export interface Response<T> {
    status: number;
    data?: T;
    error?: string;
}
