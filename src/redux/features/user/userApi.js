import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const baseQuery = fetchBaseQuery({
  baseUrl: `http://localhost:3001/api/users`,
});

const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQuery,
  tagTypes: ["User"],
  endpoints: (builders) => ({
    getProfile: builders.query({
      query: (id) => ({
        url: `/${id}`,
        method: "GET",
      }),
    }),
    // loginUser: builders.mutation({
    //   query: (data) => ({
    //     url: `/login`,
    //     method: "POST",
    //     body: data,
    //   }),
    // }),

  }),
});

export const {
    useGetProfileQuery,
} = userApi;
export default userApi;
