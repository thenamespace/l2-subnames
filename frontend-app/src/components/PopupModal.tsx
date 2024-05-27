import { PropsWithChildren } from "react"
import "./PopupModal.css";
import { createPortal } from "react-dom";
import { Card,CrossSVG } from "@ensdomains/thorin";

interface PopupModalProps extends PropsWithChildren {
    isOpen?: boolean
    onClose?: () => void
}

export const PopupModal = ({ isOpen, onClose, children }: PopupModalProps) => {

    if (!isOpen) {
        return null;
    }

    return createPortal(<div className="popup-modal">
        <div className="popup-modal-backdrop">
            <Card className="modal-content">
            <CrossSVG className="close-icon" onClick={() => onClose?.()}/>
            
            {children}
            </Card>
        </div>
    </div>, document.body)
}