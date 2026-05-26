import axios from "axios";

const BASE_URL =
    "http://127.0.0.1:8000/api/accounts";


// ======================================
// LOGIN API
// ======================================

export const loginApi = async (
    data
) => {

    return await axios.post(

        `${BASE_URL}/login/`,

        data
    );
};


// ======================================
// REGISTER API
// ======================================

export const registerApi = async (
    data
) => {

    return await axios.post(

        `${BASE_URL}/register/`,

        data
    );
};


// ======================================
// VERIFY OTP
// ======================================

export const verifyOtpApi = async (
    data
) => {

    return await axios.post(

        `${BASE_URL}/verify-otp/`,

        data
    );
};


// ======================================
// RESEND OTP
// ======================================

export const resendOtpApi = async (
    data
) => {

    return await axios.post(

        `${BASE_URL}/resend-otp/`,

        data
    );
};


// ======================================
// CURRENT USER
// ======================================

export const currentUserApi =
    async (token) => {

    return await axios.get(

        `${BASE_URL}/me/`,

        {

            headers: {

                Authorization:
                    `Bearer ${token}`
            }
        }
    );
};

// ======================================
// FORGOT PASSWORD
// ======================================

export const forgotPasswordApi = async (
    data
) => {

    return await axios.post(

        `${BASE_URL}/forgot-password/`,

        data
    );
};

// ======================================
// RESET PASSWORD
// ======================================

export const resetPasswordApi = async (
    data
) => {

    return await axios.post(

        `${BASE_URL}/reset-password/`,

        data
    );
};