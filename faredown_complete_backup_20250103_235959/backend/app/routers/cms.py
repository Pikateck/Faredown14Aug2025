"""CMS Content API Router for Faredown"""

from fastapi import APIRouter

router = APIRouter()

@router.get("/banners")
async def get_banners():
    """Get active banners"""
    return {
        "banners": [
            {
                "id": 1,
                "title": "Summer Sale",
                "description": "Up to 50% off on flights",
                "image_url": "https://example.com/banner1.jpg",
                "link_url": "/flights",
                "is_active": True
            }
        ]
    }

@router.get("/destinations")
async def get_destinations():
    """Get popular destinations"""
    return {
        "destinations": [
            {
                "id": 1,
                "name": "Dubai",
                "country": "UAE",
                "description": "Experience luxury and adventure",
                "image_url": "https://example.com/dubai.jpg",
                "featured": True
            }
        ]
    }

@router.get("/content/{page}")
async def get_page_content(page: str):
    """Get content for specific page"""
    content_map = {
        "about": {
            "title": "About Faredown",
            "content": "Faredown is the world's first AI-powered travel platform..."
        },
        "terms": {
            "title": "Terms and Conditions",
            "content": "These terms and conditions govern your use of Faredown..."
        },
        "privacy": {
            "title": "Privacy Policy",
            "content": "We respect your privacy and are committed to protecting..."
        }
    }
    
    return content_map.get(page, {"title": "Page Not Found", "content": ""})
