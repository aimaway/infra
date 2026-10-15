import { 
  Shield, Database, Network, Lock, Users, Cpu, Target, Workflow, 
  Eye, Briefcase, Server, Globe, BarChart3, Link2, TrendingUp,
  Building2, Award, BookOpen
} from 'lucide-react';

export interface NavSubItem {
  label: string;
  desc: string;
  icon: any;
  href?: string;
}

export interface NavSection {
  category: string;
  items: NavSubItem[];
}

export interface NavItem {
  label: string;
  href?: string;
  dropdown?: NavSection[];
}

export const navigationData: NavItem[] = [
  {
    label: 'Products',
    dropdown: [
      {
        category: 'Unified Platform',
        items: [
          { label: 'AI-Focused SIEM', desc: 'Next-gen security information & event management', icon: Database, href: '/service/threat-intel' },
          { label: 'NDR/OT', desc: 'Network detection and response for IT/OT', icon: Network, href: '/service/network-monitoring' },
          { label: 'ITDR', desc: 'Identity threat detection and response', icon: Lock, href: '/coming-soon/itdr' },
          { label: 'UEBA', desc: 'User and entity behavior analytics', icon: Users, href: '/service/analytics' },
          { label: 'Open XDR', desc: 'Extended detection and response platform', icon: Shield, href: '/service/endpoint-protection' },
          { label: 'Multi-Layer AI™', desc: 'Proprietary multi-layer artificial intelligence', icon: Cpu, href: '/service/analytics' },
        ]
      },
      {
        category: 'Multi-Layer AI™',
        items: [
          { label: 'How Multi-Layer AI Works', desc: 'Understanding our AI architecture', icon: Cpu, href: '/service/analytics' },
          { label: 'AI-Driven Case Management', desc: 'Intelligent case handling', icon: Briefcase, href: '/service/incident-response' },
          { label: 'AI Investigator', desc: 'AI-powered investigation assistant', icon: Eye, href: '/coming-soon/ai-investigator' },
          { label: 'Auto Triage', desc: 'Automated alert triage and prioritization', icon: Target, href: '/service/incident-response' },
          { label: 'Automated Threat Hunting', desc: 'Proactive threat discovery', icon: Target, href: '/service/threat-intel' },
          { label: 'Automated Incident Response', desc: 'SOAR-powered response', icon: Workflow, href: '/service/soar' },
        ]
      },
      {
        category: 'Security Capabilities',
        items: [
          { label: 'ISOC Platform', desc: 'Integrated security operations center', icon: Shield, href: '/coming-soon/isoc-platform' },
          { label: 'Next-Gen SIEM', desc: 'Modern SIEM with AI capabilities', icon: Database, href: '/service/threat-intel' },
          { label: 'Threat Intelligence', desc: 'Aggregated threat data and IoCs', icon: Target, href: '/service/threat-intel' },
          { label: 'Compliance Mapper', desc: 'Automated compliance mapping', icon: Shield, href: '/service/compliance' },
          { label: 'Incident Response', desc: 'End-to-end incident management', icon: Workflow, href: '/service/incident-response' },
          { label: 'Analytics', desc: 'Predictive security analytics', icon: BarChart3, href: '/service/analytics' },
        ]
      }
    ]
  },
  {
    label: 'Services',
    dropdown: [
      {
        category: 'Partner Focused',
        items: [
          { label: 'MSSP/MDR Program', desc: 'Become an Infracentra partner', icon: Link2, href: '/mssp' },
          { label: 'Open Cybersecurity Alliance', desc: 'Join our partner ecosystem', icon: Globe, href: '/mssp' },
          { label: 'Cyber Insurance Program', desc: 'RiskShield partnership', icon: Shield, href: '/mssp' },
        ]
      },
      {
        category: 'Use Cases',
        items: [
          { label: 'Increase Revenue & Margin', desc: 'Grow your security business', icon: TrendingUp, href: '/mssp' },
          { label: 'Sell SOC-as-a-Service', desc: 'Offer managed SOC services', icon: Building2, href: '/mssp' },
          { label: 'Sell MDR-as-a-Service', desc: 'Managed detection & response', icon: Shield, href: '/mssp' },
          { label: 'Universal EDR', desc: 'Bring your own EDR platform', icon: Shield, href: '/service/endpoint-protection' },
        ]
      },
      {
        category: 'Networking & PSA',
        items: [
          { label: 'Network Monitoring', desc: '24/7 NMS with SNMP/NetFlow', icon: Network, href: '/service/network-monitoring' },
          { label: 'DNS Filtering', desc: 'Cloud-delivered DNS security', icon: Globe, href: '/service/dns-filtering' },
          { label: 'Firewall Management', desc: 'Multi-vendor firewall control', icon: Lock, href: '/service/firewall-mgmt' },
          { label: 'Patch Management', desc: 'Automated patch deployment', icon: Server, href: '/service/patch-management' },
          { label: 'Backup & DR', desc: 'Immutable backups and recovery', icon: Database, href: '/service/backup-dr' },
          { label: 'Cloud Security', desc: 'Multi-cloud CSPM', icon: Shield, href: '/service/cloud-security' },
        ]
      }
    ]
  },
  {
    label: 'Why Infracentra',
    dropdown: [
      {
        category: 'Market',
        items: [
          { label: 'About Us', desc: 'Learn about Infracentra', icon: Building2, href: '/about' },
          { label: 'Industry Recognition', desc: 'Awards and analyst reports', icon: Award, href: '/about' },
          { label: 'Customer Stories', desc: 'Success stories from clients', icon: Users, href: '/about' },
          { label: 'Find a Partner', desc: 'Locate a MSSP/MDR partner', icon: Link2, href: '/mssp' },
        ]
      },
      {
        category: 'Industries',
        items: [
          { label: 'Industrial & Manufacturing', desc: 'OT/ICS security solutions', icon: Server, href: '/about' },
          { label: 'Government', desc: 'Public sector security', icon: Shield, href: '/about' },
          { label: 'Higher Education', desc: 'Academic institution security', icon: BookOpen, href: '/about' },
          { label: 'Financial Services', desc: 'Banking and finance security', icon: Building2, href: '/about' },
          { label: 'MSSP / MDR', desc: 'Managed security services', icon: Link2, href: '/mssp' },
        ]
      },
      {
        category: 'Compare',
        items: [
          { label: 'Comparison Overview', desc: 'See how we compare', icon: BarChart3, href: '/about' },
          { label: 'vs CrowdStrike', desc: 'Infracentra vs CrowdStrike', icon: Target, href: '/about' },
          { label: 'vs Microsoft Sentinel', desc: 'Infracentra vs Sentinel', icon: Database, href: '/about' },
          { label: 'vs Splunk', desc: 'Infracentra vs Splunk', icon: BarChart3, href: '/about' },
          { label: 'vs IBM QRadar', desc: 'Infracentra vs QRadar', icon: Database, href: '/about' },
        ]
      }
    ]
  },
  {
    label: 'MSSP/MDR',
    href: '/mssp'
  },
  {
    label: 'Pricing',
    href: '/pricing'
  },
  {
    label: 'Academy',
    href: '/academy'
  }
];
