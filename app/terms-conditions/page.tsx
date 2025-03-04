import React from 'react';

const TermsConditionsPage = () => {
    return (
        <div className="container mx-auto py-8 px-4 max-w-3xl">
            <h1 className="text-3xl font-bold mb-4">Terms and Conditions</h1>
            <p className="mb-4">
                Welcome to InNotes! These terms and conditions outline the rules and regulations for the use of our
                service.
            </p>

            <h2 className="text-2xl font-semibold mb-2">1. Acceptance of Terms</h2>
            <p className="mb-4">
                By accessing or using InNotes, you agree to be bound by these Terms and Conditions. If you disagree
                with any part of the terms, then you may not access the service.
            </p>

            <h2 className="text-2xl font-semibold mb-2">2. Use License</h2>
            <p className="mb-4">
                Permission is granted to temporarily download one copy of the materials (information or software) on
                InNotes for personal, non-commercial transitory viewing only.
            </p>

            <h2 className="text-2xl font-semibold mb-2">3. Disclaimer</h2>
            <p className="mb-4">
                The materials on InNotes are provided on an 'as is' basis. InNotes makes no warranties, expressed or
                implied, and hereby disclaims and negates all other warranties including, without limitation, implied
                warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of
                intellectual property or other violation of rights.
            </p>

            <h2 className="text-2xl font-semibold mb-2">4. Limitations</h2>
            <p className="mb-4">
                In no event shall InNotes or its suppliers be liable for any damages (including, without limitation,
                damages for loss of data or profit, or due to business interruption) arising out of the use or
                inability to use the materials on InNotes, even if InNotes or a InNotes authorized representative has
                been notified orally or in writing of the possibility of such damage.
            </p>

            <h2 className="text-2xl font-semibold mb-2">5. Revisions and Errata</h2>
            <p className="mb-4">
                The materials appearing on InNotes could include technical, typographical, or photographic errors.
                InNotes does not warrant that any of the materials on its website are accurate, complete or current.
                InNotes may make changes to the materials contained on its website at any time without notice.
            </p>

            <h2 className="text-2xl font-semibold mb-2">6. Links</h2>
            <p className="mb-4">
                InNotes has not reviewed all of the sites linked to its website and is not responsible for the
                contents of any such linked site. The inclusion of any link does not imply endorsement by InNotes of
                the site. Use of any such linked website is at the user's own risk.
            </p>

            <h2 className="text-2xl font-semibold mb-2">7. Governing Law</h2>
            <p className="mb-4">
                Any claim relating to InNotes shall be governed by the laws of Switzerland without regard to its
                conflict of law provisions.
            </p>

            <h2 className="text-2xl font-semibold mb-2">8. Modifications to Terms</h2>
            <p className="mb-4">
                InNotes may revise these terms of service at any time without notice. By using this website you are
                agreeing to be bound by the then current version of these terms of service.
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

export default TermsConditionsPage;
