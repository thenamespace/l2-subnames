import { PropsWithChildren } from "react";
import { Spinner } from "@ensdomains/thorin";
import "./ScreenContainer.css";
import { TopNavigation } from "./TopNavigation";

interface ScreenContainerProps extends PropsWithChildren {
    isLoading?: boolean
    hideNav?: boolean
    bg?: string
}

export const ScreenContainer = ({ children, isLoading, hideNav, bg }: ScreenContainerProps) => {

    if (isLoading) {
        return <div className="screen-container loading">
            <Spinner color="blue" size="large"/>
        </div>
    }
    let containerStyles: Record<string,string> = {};
    if (bg) {
        containerStyles.background = `url(${bg})`
        containerStyles.backgroundSize = "cover"
    }

    return <div className="screen-container" style={containerStyles}>
        {!hideNav && <TopNavigation/>}
        <div className="screen-content-container">
            {children}
        </div>
    </div>
}