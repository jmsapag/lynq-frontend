import { useTranslation } from 'react-i18next';

const HelpPage = () => {
    const { t } = useTranslation();

    return (
        <div>
            <div className="space-y-6">
                <section>
                    <h5 className="text-xl font-medium mb-2">
                        {t('help.userGuide')}
                    </h5>
                    <p className="text-gray-600">
                        {t('help.userGuideText')}
                    </p>
                </section>
                <section>
                    <h5 className="text-xl font-medium mb-2">
                        {t('help.faq')}
                    </h5>
                    <p className="text-gray-600">
                        {t('help.faqText')}
                    </p>
                </section>
            </div>
        </div>
    );
};

export default HelpPage;