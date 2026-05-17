<template>
  <div class="w-full bg-gray-100">
    <div class="">
      <!-- <aside class="flex h-full bg-white">
        <UiScrollArea class="z-10 h-full w-[300px] border-r">
          <div class="flex h-screen flex-col pt-7">
            <NuxtLink to="#" class="flex w-full items-center gap-3 px-5">
              <UiAvatar
                src="/icon.png"
                alt="Company Logo"
                class="size-7 rounded object-contain"
              />
              <span class="text-xl font-bold">Acme</span>
            </NuxtLink>
            <div class="my-6 px-5">
              <UiVeeInput
                v-model="search"
                placeholder="Search..."
                icon="lucide:search"
              />
            </div>
            <div class="flex h-full grow flex-col px-5 pb-8">
              <div class="mb-10 flex flex-col gap-10">
                <nav class="flex flex-col gap-1">
                  <template v-for="(n, i) in topNav" :key="i">
                    <UiButton
                      size="default"
                      :to="n.link"
                      variant="ghost"
                      class="justify-start gap-4 px-3"
                      @click="setMiniBarItems(n.items)"
                    >
                      <Icon
                        v-if="n.icon"
                        :name="n.icon"
                        class="size-4 text-muted-foreground"
                      />
                      <span>{{ n.title }}</span>
                      <Icon
                        v-if="n.items"
                        name="lucide:chevron-right"
                        class="ml-auto size-4 text-muted-foreground/80"
                      />
                    </UiButton>
                  </template>
                </nav>
              </div>
              <div class="mt-auto rounded-lg bg-muted/50 p-4 text-sm">
                <div class="flex items-center justify-between">
                  <p class="font-semibold">Used space</p>
                  <UiButton class="size-6" size="icon-sm" variant="ghost">
                    <Icon
                      name="lucide:x"
                      class="size-4 text-muted-foreground"
                    />
                  </UiButton>
                </div>
                <p class="mt-3 text-muted-foreground">
                  Your team has used 80% of your available space. Need more?
                </p>
                <UiProgress class="my-4 h-2" :model-value="80" />

                <div class="flex items-center gap-1">
                  <UiButton class="px-2" variant="ghost" size="sm"
                    >Dismiss</UiButton
                  >
                  <UiButton
                    class="px-2 text-sky-500 hover:text-sky-600"
                    variant="ghost"
                    size="sm"
                    >Upgrade plan</UiButton
                  >
                </div>
              </div>
              <UiDivider class="my-6" />

              <div class="p-4">
                <div class="mb-3 flex items-center gap-3">
                  <UiAvatar :src="user.avatar" class="size-10" />
                  <div class="flex-1">
                    <p class="text-sm font-semibold">{{ user.username }}</p>
                    <p class="text-xs text-muted-foreground">
                      {{ user.email }}
                    </p>
                  </div>
                  <UiDropdownMenu>
                    <UiDropdownMenuTrigger as-child>
                      <UiButton size="icon-sm" variant="ghost">
                        <Icon
                          name="lucide:more-vertical"
                          class="size-4 text-muted-foreground"
                        />
                      </UiButton>
                    </UiDropdownMenuTrigger>
                    <UiDropdownMenuContent align="end">
                      <UiDropdownMenuItem as-child>
                        <NuxtLink
                          to="/admin/profile"
                          class="inline-flex w-full items-center gap-2"
                        >
                          <Icon name="lucide:user" class="size-4" />
                          Profile
                        </NuxtLink>
                      </UiDropdownMenuItem>
                      <UiDropdownMenuItem as-child>
                        <NuxtLink
                          to="/admin/settings"
                          class="inline-flex w-full items-center gap-2"
                        >
                          <Icon name="lucide:settings" class="size-4" />
                          Settings
                        </NuxtLink>
                      </UiDropdownMenuItem>
                      <UiDropdownMenuSeparator />
                      <UiDropdownMenuItem variant="destructive">
                        <Icon name="lucide:log-out" class="size-4" />
                        Sign out
                      </UiDropdownMenuItem>
                    </UiDropdownMenuContent>
                  </UiDropdownMenu>
                </div>
                <UiProgress :model-value="storageUsed" class="h-1.5" />
                <p class="mt-2 text-xs text-muted-foreground">
                  {{ storageUsed }}% storage used
                </p>
              </div>
            </div>
          </div>
        </UiScrollArea>
      </aside> -->

      <UiSidebarProvider v-slot="{ isMobile, state }">
        <!-- App Sidebar -->
        <UiSidebar collapsible="icon" class="bg-white">
          <!-- Team switcher -->
          <UiSidebarHeader>
            <UiSidebarMenu>
              <UiSidebarMenuItem>
                <UiDropdownMenu>
                  <UiDropdownMenuTrigger as-child>
                    <UiSidebarMenuButton
                      size="lg"
                      class="group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-0! data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                      <div
                        class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
                      >
                        <img
                          v-if="activeTeam?.logo.startsWith('/')"
                          :src="activeTeam.logo"
                          :alt="activeTeam.name"
                          class="size-8 object-cover"
                        />
                        <Icon
                          v-else-if="activeTeam"
                          mode="svg"
                          :name="activeTeam.logo"
                          class="size-4"
                        />
                      </div>
                      <div class="grid flex-1 text-left text-sm leading-tight">
                        <span class="truncate font-semibold">
                          {{ activeTeam?.name }}
                        </span>
                        <span class="truncate text-xs">{{
                          activeTeam?.plan
                        }}</span>
                      </div>
                      <!-- <Icon
                        mode="svg"
                        name="lucide:chevrons-up-down"
                        class="ml-auto"
                      /> -->
                    </UiSidebarMenuButton>
                  </UiDropdownMenuTrigger>
                  <!-- <UiDropdownMenuContent
                    class="w-(--reka-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                    align="start"
                    :side="isMobile ? 'bottom' : 'right'"
                    :side-offset="4"
                  >
                    <UiDropdownMenuLabel class="text-xs text-muted-foreground">
                      Teams
                    </UiDropdownMenuLabel>
                    <template v-for="(team, index) in data.teams" :key="index">
                      <UiDropdownMenuItem
                        class="cursor-pointer gap-2 p-2"
                        :class="[team.name == activeTeam?.name && 'bg-muted']"
                        @click="activeTeam = team"
                      >
                        <div
                          class="flex size-6 items-center justify-center rounded-sm border"
                        >
                          <Icon
                            mode="svg"
                            :name="team.logo"
                            class="size-4 shrink-0"
                          />
                        </div>
                        {{ team.name }}
                        <UiDropdownMenuShortcut
                          >⌘{{ index + 1 }}</UiDropdownMenuShortcut
                        >
                      </UiDropdownMenuItem>
                    </template>
                    <UiDropdownMenuSeparator />
                    <UiDropdownMenuItem class="gap-2 p-2">
                      <div
                        class="flex size-6 items-center justify-center rounded-md border bg-background"
                      >
                        <Icon name="lucide:plus" class="size-4" />
                      </div>
                      <div class="font-medium text-muted-foreground">
                        Add team
                      </div>
                    </UiDropdownMenuItem>
                  </UiDropdownMenuContent> -->
                </UiDropdownMenu>
              </UiSidebarMenuItem>
            </UiSidebarMenu>

            <!-- Search form -->
            <form v-if="state != 'collapsed'">
              <UiSidebarGroup class="py-0">
                <UiSidebarGroupContent class="relative">
                  <UiLabel for="search" class="sr-only"> Search </UiLabel>
                  <UiSidebarInput
                    id="search"
                    placeholder="Search the docs..."
                    class="pl-8"
                  />
                  <Icon
                    name="lucide:search"
                    class="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none"
                  />
                </UiSidebarGroupContent>
              </UiSidebarGroup>
            </form>
          </UiSidebarHeader>
          <UiSidebarContent>
            <!-- Main -->
            <UiSidebarGroup>
              <UiSidebarGroupLabel label="Platform" />
              <UiSidebarGroupContent>
                <UiSidebarMenu>
                  <UiSidebarMenuItem
                    v-for="(item, index) in data.navMain"
                    :key="index"
                    v-slot="{ open }"
                    as-child
                    :default-open="item.isActive"
                  >
                    <UiSidebarMenuButton as-child>
                      <NuxtLink :href="item.url">
                        <Icon :name="item.icon" />
                        {{ item.title }}
                      </NuxtLink>

                      <!-- <a :href="item.url">
                        <Icon :name="item.icon" />
                        <span>{{ item.title }}</span>
                      </a> -->
                    </UiSidebarMenuButton>
                  </UiSidebarMenuItem>
                </UiSidebarMenu>
              </UiSidebarGroupContent>
            </UiSidebarGroup>
            <!-- Projects -->
            <UiSidebarGroup class="group-data-[collapsible=icon]:hidden">
              <UiSidebarGroupLabel label="Projects" />
              <UiSidebarMenu>
                <UiSidebarMenuItem
                  v-for="item in data.projects"
                  :key="item.name"
                >
                  <UiSidebarMenuButton as-child>
                    <NuxtLink :href="item.url">
                      <Icon mode="svg" :name="item.icon" />
                      <span>{{ item.name }}</span>
                    </NuxtLink>
                  </UiSidebarMenuButton>
                  <UiDropdownMenu>
                    <UiDropdownMenuTrigger as-child>
                      <UiSidebarMenuAction show-on-hover>
                        <Icon
                          mode="svg"
                          name="lucide:ellipsis-vertical"
                          class="rotate-90"
                        />
                        <span class="sr-only">More</span>
                      </UiSidebarMenuAction>
                    </UiDropdownMenuTrigger>
                    <UiDropdownMenuContent
                      class="w-48 rounded-lg"
                      :side="isMobile ? 'bottom' : 'right'"
                      :align="isMobile ? 'end' : 'start'"
                    >
                      <UiDropdownMenuItem>
                        <Icon
                          mode="svg"
                          name="lucide:folder"
                          class="text-muted-foreground"
                        />
                        <span>View Project</span>
                      </UiDropdownMenuItem>
                      <UiDropdownMenuItem>
                        <Icon
                          name="lucide:forward"
                          class="text-muted-foreground"
                        />
                        <span>Share Project</span>
                      </UiDropdownMenuItem>
                      <UiDropdownMenuSeparator />
                      <UiDropdownMenuItem>
                        <Icon
                          name="lucide:trash-2"
                          class="text-muted-foreground"
                        />
                        <span>Delete Project</span>
                      </UiDropdownMenuItem>
                    </UiDropdownMenuContent>
                  </UiDropdownMenu>
                </UiSidebarMenuItem>

                <UiSidebarMenuItem>
                  <UiSidebarMenuButton class="text-sidebar-foreground/70">
                    <Icon
                      name="lucide:ellipsis-vertical"
                      class="rotate-90 text-sidebar-foreground/70"
                    />
                    <span>More</span>
                  </UiSidebarMenuButton>
                </UiSidebarMenuItem>
              </UiSidebarMenu>
            </UiSidebarGroup>
          </UiSidebarContent>
          <UiSidebarRail />
          <!-- Footer-->
          <UiSidebarFooter>
            <UiSidebarMenu>
              <UiSidebarMenuItem>
                <div class="mt-auto rounded-lg bg-muted/50 p-4 text-sm">
                  <div class="flex items-center justify-between">
                    <p class="font-semibold">Used space</p>
                    <UiButton class="size-6" size="icon-sm" variant="ghost">
                      <Icon
                        name="lucide:x"
                        class="size-4 text-muted-foreground"
                      />
                    </UiButton>
                  </div>
                  <p class="mt-3 text-muted-foreground">
                    You have used {{ storageUsed }}% of your available AI
                    credits. Need more?
                  </p>
                  <UiProgress class="my-3 h-2" :model-value="80" />

                  <div class="flex items-center justify-between gap-1">
                    <UiButton class="px-2" variant="ghost" size="xs"
                      >Dismiss</UiButton
                    >
                    <UiButton
                      class="px-2 text-red-500 hover:text-red-600"
                      variant="ghost"
                      size="xs"
                      >Upgrade credits</UiButton
                    >
                  </div>
                </div>
                <UiDivider class="my-6" />
                <!-- <div class="py-4">
                  <UiProgress :model-value="storageUsed" class="h-1.5" />
                  <p class="mt-2 text-xs text-muted-foreground">
                    {{ storageUsed }}% storage used
                  </p>
                  <div class="flex items-center gap-1">
                    <UiButton class="px-2" variant="ghost" size="sm"
                      >Dismiss</UiButton
                    >
                    <UiButton
                      class="px-2 text-sky-500 hover:text-sky-600"
                      variant="ghost"
                      size="sm"
                      >Upgrade plan</UiButton
                    >
                  </div>
                </div> -->
                <UiDropdownMenu>
                  <UiDropdownMenuTrigger as-child>
                    <UiSidebarMenuButton
                      size="lg"
                      class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                      <UiAvatar class="size-8 rounded-lg">
                        <UiAvatarImage
                          :src="data.user.avatar"
                          :alt="data.user.name"
                        />
                        <UiAvatarFallback class="rounded-lg"
                          >BB</UiAvatarFallback
                        >
                      </UiAvatar>
                      <div class="grid flex-1 text-left text-sm leading-tight">
                        <span class="truncate font-semibold">{{
                          data.user.name
                        }}</span>
                        <span class="truncate text-xs">{{
                          data.user.email
                        }}</span>
                      </div>
                      <Icon
                        name="lucide:chevrons-up-down"
                        class="ml-auto size-4"
                      />
                    </UiSidebarMenuButton>
                  </UiDropdownMenuTrigger>
                  <UiDropdownMenuContent
                    class="w-(--reka-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                    :side="isMobile ? 'bottom' : 'right'"
                    :side-offset="4"
                    align="end"
                  >
                    <UiDropdownMenuLabel class="p-0 font-normal">
                      <div
                        class="flex items-center gap-2 px-1 py-1.5 text-left text-sm"
                      >
                        <UiAvatar class="size-8 rounded-lg">
                          <UiAvatarImage
                            :src="data.user.avatar"
                            :alt="data.user.name"
                          />
                          <UiAvatarFallback class="rounded-lg"
                            >BB</UiAvatarFallback
                          >
                        </UiAvatar>
                        <div
                          class="grid flex-1 text-left text-sm leading-tight"
                        >
                          <span class="truncate font-semibold">{{
                            data.user.name
                          }}</span>
                          <span class="truncate text-xs">{{
                            data.user.email
                          }}</span>
                        </div>
                      </div>
                    </UiDropdownMenuLabel>
                    <UiDropdownMenuSeparator />
                    <UiDropdownMenuGroup>
                      <UiDropdownMenuItem
                        icon="lucide:sparkles"
                        title="Upgrade to Pro"
                      />
                    </UiDropdownMenuGroup>
                    <UiDropdownMenuSeparator />
                    <UiDropdownMenuGroup>
                      <UiDropdownMenuItem
                        icon="lucide:badge-check"
                        title="Account"
                      />

                      <UiDropdownMenuItem
                        icon="lucide:credit-card"
                        title="Billing"
                      />
                      <UiDropdownMenuItem
                        icon="lucide:settings-2"
                        title="Settings"
                      />
                      <UiDropdownMenuItem
                        icon="lucide:bell"
                        title="Notifications"
                      />
                    </UiDropdownMenuGroup>
                    <UiDropdownMenuSeparator />
                    <UiDropdownMenuItem icon="lucide:log-out" title="Log out" />
                  </UiDropdownMenuContent>
                </UiDropdownMenu>
              </UiSidebarMenuItem>
            </UiSidebarMenu>
          </UiSidebarFooter>
        </UiSidebar>

        <UiSidebarInset class="bg-transparent">
          <slot />
        </UiSidebarInset>
      </UiSidebarProvider>
    </div>
  </div>
</template>

<script setup lang="ts">
const search = ref<string>("");
const showMiniSidebar = ref<boolean>(false);
const miniSidebarItems = ref<Array<any>>();
const sideBarRef = ref<any>();
const storageUsed = 68;

onClickOutside(sideBarRef, () => {
  showMiniSidebar.value = false;
  miniSidebarItems.value = [];
});

const user = {
  avatar: "https://randomuser.me/api/portraits/med/men/2.jpg",
  username: "Jane Doe",
  email: "muzcad@he.tg",
};

const data = {
  user: {
    name: "breezy",
    email: "m@example.com",
    avatar: "https://behonbaker.com/icon.png",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: "lucide:gallery-vertical-end",
      plan: "Enterprise",
    },
    {
      name: "Notably",
      logo: "/notably-mark.svg",
      plan: "",
    },
    {
      name: "Evil Corp.",
      logo: "lucide:command",
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: "lucide:layout-dashboard",
      isActive: false,
    },
    {
      title: "Posts",
      url: "/admin/posts",
      icon: "lucide:file-text",
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: "lucide:chart-bar",
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: "lucide:settings-2",
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: "lucide:frame",
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: "lucide:pie-chart",
    },
    {
      name: "Travel",
      url: "#",
      icon: "lucide:map",
    },
  ],
};
const activeTeam = ref(data.teams[1]);

const topNav = [
  { title: "Dashboard", icon: "lucide:home", link: "/admin" },
  {
    title: "Profile",
    icon: "lucide:user",
    link: "/admin/profile",
  },
  {
    title: "Statistics",
    icon: "lucide:bar-chart-3",
    link: "/admin/statistics",
  },
];

const setMiniBarItems = (items?: any) => {
  if (!items) return (showMiniSidebar.value = false);
  miniSidebarItems.value = items;
  showMiniSidebar.value = true;
};
</script>
