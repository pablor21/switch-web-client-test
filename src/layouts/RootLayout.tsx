import { Suspense, useState } from "react";
import { Await, isRouteErrorResponse, useAsyncError, useLoaderData, useOutlet, useRouteError } from "react-router-dom";
import { AuthProvider } from "../hooks/useAuth";


function ErrorBoundary() {
    const error: any = useAsyncError();
    return (
        <div>
            Error {error.status}: {error.message}
        </div>
    );

}

export const RootLayout = () => {
    const outlet: any = useOutlet();
    const [loaded, setLoaded] = useState(false)
    const { userPromise }: any = useLoaderData();

    return (
        <Suspense fallback={<div>Loading</div>}>
            <Await
                resolve={userPromise}
                errorElement={<ErrorBoundary />}
                children={(user) => (
                    <AuthProvider userData={user}>{outlet}</AuthProvider>
                )}
            />
        </Suspense>
    );
};
