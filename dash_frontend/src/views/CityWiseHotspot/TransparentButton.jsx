import React from 'react';
import { Button } from 'reactstrap';
import { MdClose } from 'react-icons/md';  // Import the cross (X) icon from react-icons

const TransparentButton = ({ togglePanel }) => {
    return (
        <Button
            color="link"  // Use "link" to make the button transparent
            onClick={togglePanel}
            style={{
                padding: '0',  // Remove padding to make it compact
                minWidth: 'auto', // Minimize width
                minHeight: 'auto', // Minimize height
                fontSize: '1.5rem', // Size of the cross icon
            }}
        >
            <MdClose style={{ color: '#000', fontSize: '1.5rem' }} /> {/* Add cross icon */}
        </Button>
    );
};

export default TransparentButton;
