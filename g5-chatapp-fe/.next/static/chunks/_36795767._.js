(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/components/ui/input.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "Input": (()=>Input)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
;
const Input = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(_c = ({ className, type, ...props }, ref)=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
        type: type,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
        ref: ref,
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/input.tsx",
        lineNumber: 8,
        columnNumber: 7
    }, this);
});
_c1 = Input;
Input.displayName = "Input";
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Input$React.forwardRef");
__turbopack_context__.k.register(_c1, "Input");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/ui/button.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "Button": (()=>Button),
    "buttonVariants": (()=>buttonVariants)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-slot/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
;
;
;
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
    variants: {
        variant: {
            default: "bg-primary text-primary-foreground hover:bg-primary/90",
            destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            ghost: "hover:bg-accent hover:text-accent-foreground",
            link: "text-primary underline-offset-4 hover:underline"
        },
        size: {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-md px-3",
            lg: "h-11 rounded-md px-8",
            icon: "h-10 w-10"
        }
    },
    defaultVariants: {
        variant: "default",
        size: "default"
    }
});
const Button = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(_c = ({ className, variant, size, asChild = false, ...props }, ref)=>{
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Slot"] : "button";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(buttonVariants({
            variant,
            size,
            className
        })),
        ref: ref,
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/button.tsx",
        lineNumber: 46,
        columnNumber: 7
    }, this);
});
_c1 = Button;
Button.displayName = "Button";
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Button$React.forwardRef");
__turbopack_context__.k.register(_c1, "Button");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/lib/socket.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "disconnectSocket": (()=>disconnectSocket),
    "getSocket": (()=>getSocket)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAuthStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/useAuthStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$socket$2e$io$2d$client$2f$build$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/socket.io-client/build/esm/index.js [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$socket$2e$io$2d$client$2f$build$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/socket.io-client/build/esm/index.js [app-client] (ecmascript) <locals>");
;
;
let socket = null;
const getSocket = ()=>{
    if (!socket) {
        const { user, setActiveUsers } = __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAuthStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuthStore"].getState();
        socket = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$socket$2e$io$2d$client$2f$build$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["io"])("http://localhost:3000", {
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });
        socket.on("connect", ()=>{
            console.log("Socket connected:", socket?.id);
            if (user?.id) {
                socket?.emit("login", {
                    userId: user.id
                });
            }
            socket?.on("activeUsers", (data)=>{
                console.log("Active users:", data.activeUsers);
                setActiveUsers(data.activeUsers);
            });
        });
        socket.on("disconnect", ()=>{
            console.log("Socket disconnected:", socket?.id);
        });
    }
    return socket;
};
const disconnectSocket = ()=>{
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/api/api.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/js-cookie/dist/js.cookie.mjs [app-client] (ecmascript)");
;
;
const api = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].create({
    baseURL: "http://localhost:3000",
    withCredentials: true
});
const getAccessToken = ()=>{
    const token = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get("accessToken");
    return token ? `Bearer ${token}` : "";
};
api.interceptors.request.use(async (config)=>{
    const publicEndpoints = [
        "/auth/sign-in",
        "/auth/sign-up",
        "/auth/refresh-token",
        "/auth/forgot-password",
        "/auth/forgot-password-verification"
    ];
    const isPublicEndpoint = publicEndpoints.some((endpoint)=>config.url?.includes(endpoint));
    const token = getAccessToken();
    if (isPublicEndpoint) {
        delete config.headers.Authorization;
        return config;
    }
    if (token) {
        config.headers.Authorization = token;
    }
    return config;
}, (error)=>{
    return Promise.reject(error);
});
api.interceptors.response.use((response)=>{
    return response;
}, async (error)=>{
    if (error.response.status === 401) {
        try {
            const store = localStorage.getItem("auth-storage");
            const userId = store ? JSON.parse(store).stats.user._id : null;
            const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post("/auth/refresh-token/" + userId, {}, {
                withCredentials: true
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].set("accessToken", data.accessToken, {
                expires: 1,
                secure: true,
                sameSite: "Strict"
            });
            error.config.headers.Authorization = `Bearer ${data.accessToken}`;
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].request(error.config);
        } catch (error) {
            console.log("Refresh token expired or invalid", error);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].remove("accessToken");
            window.location.href = "/login";
        }
    }
    return Promise.reject(error);
});
const __TURBOPACK__default__export__ = api;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/store/useAuthStore.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "useAuthStore": (()=>useAuthStore)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/middleware.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$socket$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/socket.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$api$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/api/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/js-cookie/dist/js.cookie.mjs [app-client] (ecmascript)");
;
;
;
;
;
;
const useAuthStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["persist"])((set, get)=>({
        user: null,
        isAuthenticated: false,
        isLogging: false,
        errorLogging: null,
        isRegistering: false,
        errorRegistering: null,
        userRegistrationId: null,
        emailForgotPassword: null,
        socket: null,
        activeUsers: [],
        login: async (dataLogin)=>{
            set({
                isLogging: true,
                errorLogging: null,
                emailForgotPassword: null
            });
            try {
                const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$api$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post("/auth/sign-in", dataLogin);
                if (data.success) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].set("accessToken", data.data.token, {
                        expires: 1,
                        secure: true,
                        sameSite: "Strict"
                    });
                    const result = data.data;
                    set({
                        user: result.user,
                        isAuthenticated: true
                    });
                    setTimeout(()=>{
                        get().connectSocket();
                    }, 0);
                    return true;
                }
                return false;
            } catch (error) {
                set({
                    errorLogging: "Login failed"
                });
                return false;
            } finally{
                set({
                    isLogging: false
                });
            }
        },
        register: async (dataRegister)=>{
            set({
                isRegistering: true,
                errorRegistering: null,
                emailForgotPassword: null
            });
            try {
                const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$api$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post("/auth/sign-up", dataRegister);
                set({
                    userRegistrationId: data.data.userId
                });
                setTimeout(()=>{
                    window.location.href = `/verify-otp`;
                }, 500);
            } catch (error) {
                set({
                    errorRegistering: "Registration failed"
                });
            } finally{
                set({
                    isRegistering: false
                });
            }
        },
        logout: async ()=>{
            set({
                user: null,
                isAuthenticated: false,
                emailForgotPassword: null
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].remove("accessToken"); // Remove the access token from cookies
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].remove("refreshToken"); // Remove the refresh token from cookies
            useAuthStore.persist.clearStorage(); // Clear the persisted state
            useAuthStore.persist.rehydrate(); // Rehydrate the store to its initial state
            // set({ user: null, isAuthenticated: false, emailForgotPassword: null });
            // get().disconnectSocket(); // Disconnect the socket on logout
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$socket$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["disconnectSocket"])(); // Disconnect the socket on logout
            set({
                socket: null
            });
        },
        getMyProfile: async ()=>{
            // set({  error: null });
            const id = get().user?.id;
            try {
                const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$api$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`/users/${id}`);
                // fix after backend response
                const userid = data.data._id;
                set({
                    user: {
                        ...data.data,
                        id: userid
                    }
                });
            } catch (error) {
            // set({ error: "Failed to fetch profile" });
            } finally{
            // set({ isLoading: false });
            }
        },
        verifyOtp: async (userId, otp)=>{
            // set({ isLoading: true, error: null });
            try {
                const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$api$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`/auth/verify-otp/${userId}`, {
                    otp
                });
                if (data.success) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].set("accessToken", data.data.token, {
                        expires: 1,
                        secure: true,
                        sameSite: "Strict"
                    });
                    const result = data.data;
                    set({
                        user: result.user,
                        isAuthenticated: true
                    });
                    setTimeout(()=>{
                        get().connectSocket();
                    }, 0);
                    setTimeout(()=>{
                        window.location.href = "/conversations";
                    }, 1000);
                    return true;
                }
                return false;
            } catch (error) {
                // set({ error: "OTP verification failed" });
                return false;
            } finally{
            // set({ isLoading: false });
            }
        },
        provideOtp: async (userId)=>{
            // set({ isLoading: true, error: null });
            try {
                const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$api$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`/auth/provide-otp/${userId}`);
                set({
                    userRegistrationId: data.data.userId
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("OTP sent successfully!");
            } catch (error) {
            // set({ error: "Failed to send OTP" });
            } finally{
            // set({ isLoading: false });
            }
        },
        forgotPassword: async (email, newPassword)=>{
            // set({ isLoading: true, error: null });
            try {
                const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$api$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post("/auth/forgot-password", {
                    email,
                    newPassword
                });
                if (data.success) {
                    set({
                        emailForgotPassword: email
                    });
                    setTimeout(()=>{
                        window.location.href = `/verify-otp`;
                    }, 500);
                }
            } catch (error) {
                // set({ error: "Failed to reset password" });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to reset password. Please try again.");
            } finally{
            // set({ isLoading: false });
            }
        },
        verifyForgotPassword: async (email, otp)=>{
            // set({ isLoading: true, error: null });
            try {
                const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$api$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post("/auth/forgot-password-verification", {
                    email,
                    otp
                });
                if (data.success) {
                    set({
                        emailForgotPassword: email
                    });
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("OTP verified successfully!");
                    setTimeout(()=>{
                        window.location.href = "/auth/login";
                    }, 1000);
                    return true;
                }
                return false;
            } catch (error) {
                // set({ error: "OTP verification failed" });
                // toast.error("OTP verification failed. Please try again.");
                return false;
            } finally{
            // set({ isLoading: false });
            }
        },
        setActiveUsers: (activeUsers)=>{
            set({
                activeUsers
            });
        },
        connectSocket: ()=>{
            const user = get().user;
            if (!user || get().socket?.connected) return;
            const socket = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$socket$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSocket"])();
            // const socket = io("http://localhost:3000", {
            //   autoConnect: true,
            //   reconnection: true,
            // });
            // socket.on("connect", () => {
            //   console.log("Socket connected:", socket?.id);
            //   socket?.emit("login", {
            //     userId: user?.id || "userId",
            //   });
            //   socket?.on("activeUsers", (data) => {
            //     console.log("Active users:", data.activeUsers);
            //     set({ activeUsers: data.activeUsers });
            //   });
            // });
            socket.emit("login", {
                userId: user.id
            });
            set({
                socket
            });
        },
        disconnectSocket: ()=>{
            // disconnectSocket();
            const { socket } = get();
            if (socket) {
                socket.disconnect();
                console.log("Socket disconnected:", socket?.id);
            }
            set({
                socket: null
            });
        },
        changeAvatar: async (file)=>{
            const formData = new FormData();
            formData.append("file", file);
            try {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].loading("Uploading avatar...", {
                    id: "avatar-upload"
                });
                const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$api$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].put("/users/change-avatar", formData);
                if (data.success) {
                    const updatedUser = {
                        ...get().user,
                        avatar: data.data.avatar,
                        id: get().user?.id || "",
                        firstName: get().user?.firstName || "",
                        lastName: get().user?.lastName || "",
                        email: get().user?.email || "",
                        gender: get().user?.gender || "",
                        dob: get().user?.dob || ""
                    };
                    set({
                        user: updatedUser
                    });
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Avatar updated successfully!", {
                        id: "avatar-upload"
                    });
                }
            } catch (error) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to update avatar. Please try again.", {
                    id: "avatar-upload"
                });
            }
        },
        updateProfile: async (data)=>{
            try {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].loading("Updating profile...", {
                    id: "profile-update"
                });
                const formData = new FormData();
                formData.append("firstName", data.firstName);
                formData.append("lastName", data.lastName);
                formData.append("gender", data.gender);
                formData.append("dob", data.dob);
                const { data: response } = await __TURBOPACK__imported__module__$5b$project$5d2f$api$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].put("/users", formData);
                if (response.success) {
                    set({
                        user: response.data
                    });
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Profile updated successfully!", {
                        id: "profile-update"
                    });
                }
            } catch (error) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to update profile. Please try again.", {
                    id: "profile-update"
                });
            }
        },
        subscribeActiveUsers: ()=>{
            const socket = get().socket;
            if (socket) {
                console.log("Subscribing to active users events...");
                socket.on("activeUsers", (data)=>{
                    console.log("Received active users:", data.activeUsers);
                    set({
                        activeUsers: data.activeUsers
                    });
                });
            }
        },
        unsubscribeActiveUsers: ()=>{
            const socket = get().socket;
            if (socket) {
                console.log("Unsubscribing from active users events...");
                socket.off("activeUsers");
            }
        }
    }), {
    name: "auth-storage",
    partialize: (state)=>Object.fromEntries(Object.entries(state).filter(([key])=>key !== "socket")),
    onRehydrateStorage: ()=>(state)=>{
            if (state?.isAuthenticated) {
                state.connectSocket();
            }
        }
}));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/app/(auth)/verify-otp/page.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/input.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAuthStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/store/useAuthStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
const OtpVerifyPage = (props)=>{
    _s();
    const [otp, setOtp] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Array(6).fill(""));
    const [activeInput, setActiveInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [countdown, setCountdown] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(90);
    const inputRefs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])([]);
    const { verifyOtp, provideOtp, userRegistrationId, emailForgotPassword, verifyForgotPassword } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAuthStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuthStore"])();
    const formatTime = (seconds)=>{
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    const handleChange = (value, index)=>{
        if (!/^\d*$/.test(value)) return;
        const newOtp = [
            ...otp
        ];
        newOtp[index] = value.slice(-1); // Only take last character
        setOtp(newOtp);
        if (value && index < 5) {
            setActiveInput(index + 1);
            inputRefs.current[index + 1]?.focus();
        }
    };
    const handleKeyDown = (e, index)=>{
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            setActiveInput(index - 1);
            inputRefs.current[index - 1]?.focus();
        }
    };
    const handlePaste = (e)=>{
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 6);
        const newOtp = [
            ...otp
        ];
        pastedData.split("").forEach((char, i)=>{
            if (i < 6 && /^\d+$/.test(char)) {
                newOtp[i] = char;
            }
        });
        setOtp(newOtp);
        setActiveInput(Math.min(pastedData.length - 1, 5));
        inputRefs.current[Math.min(pastedData.length - 1, 5)]?.focus();
    };
    const handleSubmit = async (e)=>{
        e.preventDefault();
        const enteredOtp = otp.join("");
        // Add your OTP verification logic here
        if (emailForgotPassword === null) {
            console.log("OTP submitted:", enteredOtp);
            if (enteredOtp.length === 6 && !otp.some((digit)=>digit === "") && userRegistrationId) {
                await verifyOtp(userRegistrationId, enteredOtp);
            } else {
                console.error("Invalid OTP length");
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Invalid OTP length");
            }
        } else {
            console.log("OTP submitted:", enteredOtp);
            if (enteredOtp.length === 6 && !otp.some((digit)=>digit === "")) {
                await verifyForgotPassword(emailForgotPassword, enteredOtp);
            } else {
                console.error("Invalid OTP length");
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Invalid OTP length");
            }
        }
    };
    const handleResend = ()=>{
        setCountdown(90);
        // Add resend OTP logic here
        console.log("Resending OTP...");
        if (userRegistrationId) {
            provideOtp(userRegistrationId);
        } else {
            console.error("User registration ID is not available");
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("User registration ID is not available");
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "OtpVerifyPage.useEffect": ()=>{
            if (countdown > 0) {
                const timer = setInterval({
                    "OtpVerifyPage.useEffect.timer": ()=>{
                        setCountdown({
                            "OtpVerifyPage.useEffect.timer": (prev)=>prev - 1
                        }["OtpVerifyPage.useEffect.timer"]);
                    }
                }["OtpVerifyPage.useEffect.timer"], 1000);
                return ({
                    "OtpVerifyPage.useEffect": ()=>clearInterval(timer)
                })["OtpVerifyPage.useEffect"];
            }
        }
    }["OtpVerifyPage.useEffect"], [
        countdown
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex min-h-screen items-center justify-center bg-gray-100 p-4",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
            onSubmit: handleSubmit,
            className: "w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-lg",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-2 text-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-3xl font-bold",
                            children: "OTP Verification"
                        }, void 0, false, {
                            fileName: "[project]/app/(auth)/verify-otp/page.tsx",
                            lineNumber: 109,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-gray-600",
                            children: "We've sent a 6-digit code to your email. Enter it below to continue."
                        }, void 0, false, {
                            fileName: "[project]/app/(auth)/verify-otp/page.tsx",
                            lineNumber: 110,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/(auth)/verify-otp/page.tsx",
                    lineNumber: 108,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-center space-x-2",
                    children: otp.map((value, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                            ref: (el)=>{
                                inputRefs.current[index] = el;
                                if (activeInput === index) el?.focus();
                            },
                            type: "text",
                            inputMode: "numeric",
                            value: value,
                            onChange: (e)=>handleChange(e.target.value, index),
                            onKeyDown: (e)=>handleKeyDown(e, index),
                            onPaste: handlePaste,
                            onFocus: ()=>setActiveInput(index),
                            className: "h-14 w-14 text-center text-2xl font-semibold [&::-webkit-inner-spin-button]:appearance-none",
                            maxLength: 1,
                            autoFocus: index === 0
                        }, index, false, {
                            fileName: "[project]/app/(auth)/verify-otp/page.tsx",
                            lineNumber: 117,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/app/(auth)/verify-otp/page.tsx",
                    lineNumber: 115,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                    type: "submit",
                    className: "w-full text-lg",
                    disabled: otp.some((digit)=>digit === ""),
                    children: "Verify OTP"
                }, void 0, false, {
                    fileName: "[project]/app/(auth)/verify-otp/page.tsx",
                    lineNumber: 137,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center text-sm text-gray-600",
                    children: countdown > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: [
                            "Resend code in ",
                            formatTime(countdown),
                            " seconds"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(auth)/verify-otp/page.tsx",
                        lineNumber: 147,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: handleResend,
                        className: "text-primary hover:text-primary/80 font-medium underline",
                        children: "Resend OTP"
                    }, void 0, false, {
                        fileName: "[project]/app/(auth)/verify-otp/page.tsx",
                        lineNumber: 149,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/(auth)/verify-otp/page.tsx",
                    lineNumber: 145,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/(auth)/verify-otp/page.tsx",
            lineNumber: 107,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/(auth)/verify-otp/page.tsx",
        lineNumber: 106,
        columnNumber: 5
    }, this);
};
_s(OtpVerifyPage, "m1ud/8tr77OxDU+D/CemAAYMqX8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$store$2f$useAuthStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuthStore"]
    ];
});
_c = OtpVerifyPage;
const __TURBOPACK__default__export__ = OtpVerifyPage;
var _c;
__turbopack_context__.k.register(_c, "OtpVerifyPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=_36795767._.js.map