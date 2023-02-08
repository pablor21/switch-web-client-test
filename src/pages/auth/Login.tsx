import * as React from 'react';
import { useNavigate, useNavigation } from 'react-router';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import config from '../../Config';

export default function SignInSide() {

    const navigate = useNavigate();
    const [token, setToken] = useLocalStorage("token", null);
    const [user, setUser] = useLocalStorage("user", null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const plainFormData = Object.fromEntries(data.entries());
        const formDataJsonString = JSON.stringify(plainFormData);

        const res = await fetch(`${config.AUTH_SERVER_URL}api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: formDataJsonString
        });
        const json: any = await res.json();
        setToken(json.access_token);

        const res2 = await fetch(`${config.AUTH_SERVER_URL}api/user`, {
            headers: {
                'authtoken': json.access_token,
            },
        });

        setUser(await res2.json());
        window.location.reload();
    };

    return (
        <div className="page">
            <div className="page-content">
                <div className="page-content-left" style={{
                    backgroundImage: 'url(https://source.unsplash.com/random)',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}>
                </div>
                <div className="page-content-right">
                    <form onSubmit={handleSubmit} noValidate>
                        <label>
                            <b>Username</b>
                            <input type="text" placeholder="Enter Username" name="email" required />
                        </label>
                        <label>
                            <b>Password</b>
                            <input type="password" placeholder="Enter Password" name="password" required />
                        </label>
                        <div style={{
                            marginTop: '30px',
                        }}>
                            <button type="submit" className='btn btn-block'>
                                Sign in
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
}
