import axiosClient from "./axiosClient"; // Hoặc đường dẫn chính xác tới file axiosClient của bạn

export interface ProductDTO {
    id?: number;
    name: string;
    category: string;
    merchant: string;
    price: number;
    stock: number;
}

export const productApi = {
    // 1. Lấy toàn bộ danh sách sản phẩm (Backend: GET /api/v1/products)
    getAll: () => {
        return axiosClient.get<ProductDTO[]>("/products");
    },

    // 2. Lấy chi tiết 1 sản phẩm theo ID (Backend: GET /api/v1/products/{id})
    getById: (id: number) => {
        return axiosClient.get<ProductDTO>(`/products/${id}`);
    },

    // 3. Thêm mới sản phẩm (Backend: POST /api/v1/products)
    create: (product: ProductDTO) => {
        return axiosClient.post<ProductDTO>("/products", product);
    },

    // 4. Cập nhật thông tin (Backend: PUT /api/v1/products/{id})
    update: (id: number, product: ProductDTO) => {
        return axiosClient.put<ProductDTO>(`/products/${id}`, product);
    },

    // 5. Xóa sản phẩm (Backend: DELETE /api/v1/products/{id})
    remove: (id: number) => {
        return axiosClient.delete<void>(`/products/${id}`);
    }
};