import React from 'react';

const PrivacyPage = () => {
    return (
        <div className="container mx-auto py-8 px-4 max-w-3xl">
            <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
            <p className="mb-4">
                Welcome to InNotes! This Privacy Policy outlines how we collect, use, and protect your personal
                information.
            </p>

            <h2 className="text-2xl font-semibold mb-2">1. Information We Collect</h2>
            <p className="mb-4">
                We collect the following types of information:
                <ul>
                    <li><strong>Personal Information:</strong> When you register, we collect your username, email
                        address, and password.
                    </li>
                    <li><strong>Usage Data:</strong> We collect information about how you use InNotes, such as the
                        notes you create and the features you use.
                    </li>
                </ul>
            </p>

            <h2 className="text-2xl font-semibold mb-2">2. How We Use Your Information</h2>
            <p className="mb-4">
                We use your information for the following purposes:
                <ul>
                    <li>To provide and maintain InNotes.</li>
                    <li>To personalize your experience.</li>
                    <li>To communicate with you about updates and new features.</li>
                    <li>To improve InNotes.</li>
                </ul>
            </p>

            <h2 className="text-2xl font-semibold mb-2">3. Data Security</h2>
            <p className="mb-4">
                We take reasonable measures to protect your personal information from unauthorized access, use, or
                disclosure.
            </p>

            <h2 className="text-2xl font-semibold mb-2">4. Data Sharing</h2>
            <p className="mb-4">
                We do not share your personal information with third parties except as necessary to provide InNotes or
                as required by law.
            </p>

            <h2 className="text-2xl font-semibold mb-2">5. Your Rights</h2>
            <p className="mb-4">
                You have the right to access, correct, or delete your personal information. Please contact us if you
                would like to exercise these rights.
            </p>

            <h2 className="text-2xl font-semibold mb-2">6. Changes to This Policy</h2>
            <p className="mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the
                new policy on this page.
            </p>

            <h2 className="text-2xl font-semibold mb-2">7. Contact Us</h2>
            <p className="mb-4">
                If you have any questions about this Privacy Policy, please contact us.
            </p>

            <div className={"footer-container"}>
                Made with <span>❤</span>️ by{" "}
                <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="http://marco.visin.ch"
                >
                    Marco Visin - marco.visin.ch
                </a>
            </div>
        </div>
    );
};

export default PrivacyPage;
