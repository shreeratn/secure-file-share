import {LineShadowText} from "../magicui/line-shadow-text.tsx";
import {Login} from "./Login.tsx";

export default function Auth() {
    return (
        <div className="flex h-screen p-1">
            <div className="w-3/5 flex justify-center items-center bg-black text-white rounded-lg">
                <h1 className="text-balance text-5xl font-semibold leading-none tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl">
                    <span className="block">Abnormal</span>
                    <span className="block">
                        <LineShadowText className="italic" shadowColor={"white"}>
                            Security
                        </LineShadowText>
                    </span>
                </h1>
            </div>
            <div className="w-2/5 flex justify-center items-center">
            <Login></Login></div>
        </div>
    );
}
