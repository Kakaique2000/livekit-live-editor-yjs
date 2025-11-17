import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '@/components/ui/navigation-menu';
import { Link } from '@tanstack/react-router';


export default function Header() {


    const activeProps = { className: 'bg-primary/20 opacity-50 pointer-events-none' }
    return (
        <div className="p-4 mx-auto max-w-3xlbg-secondary/20  rounded-md">
            <NavigationMenu >
                <NavigationMenuList>
                    <NavigationMenuItem>
                        <NavigationMenuLink asChild>
                            <Link activeProps={activeProps} to="/room/editor">Editor</Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink asChild>
                            <Link activeProps={activeProps} to="/room/whiteboard">Whiteboard</Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </div>
    )
}