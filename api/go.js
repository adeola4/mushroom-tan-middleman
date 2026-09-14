export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const plan = req.query.plan || 'standard';
  const checkoutLinks = {
    standard: 'mailto:orders@mushroomtan.com?subject=Bulk%20Quote%20Request',
    consultation: 'mailto:orders@mushroomtan.com?subject=Consultation%20Request',
    guide: '/F1.UltimateGuideToLandStrategies.pdf'
  };

  const redirectUrl = checkoutLinks[plan] || checkoutLinks.standard;

  res.writeHead(302, { Location: redirectUrl });
  res.end();
};
