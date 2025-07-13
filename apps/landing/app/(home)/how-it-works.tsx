import { Rocket, BarChart3, Lightbulb, ListChecks } from "lucide-react";

export default function HowItWorks() {
  return (
    <section className="py-24 max-w-7xl mx-auto" id="how-it-works">
      <div className="mx-auto">
        <div className="text-center">
          <h2 className="text-title text-balance text-4xl font-semibold lg:text-5xl">
            How Ray AI Works
          </h2>
          <p className="text-body mt-4 text-muted-foreground">
            Everything you need to validate, build, and launch your SaaS product
            successfully
          </p>
        </div>
        <div className="pt-20">
          <div className="mx-auto">
            <div className="relative">
              <div className="relative z-10 grid gap-4 grid-cols-6">
                {/* Customizable Card */}
                <div className="card col-span-full lg:col-span-2 overflow-hidden flex relative border border-border rounded-xl p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
                  <div className="size-fit m-auto relative">
                    <div className="relative h-24 w-56 flex items-center">
                      <div className="absolute inset-0 size-full text-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full"></div>
                      <span className="w-fit block mx-auto text-5xl font-semibold text-transparent bg-clip-text bg-gradient-to-br from-primary to-cyan-700 dark:from-primary dark:to-cyan-700">
                        100%
                      </span>
                    </div>
                    <h2 className="mt-6 text-center font-semibold text-3xl text-title">
                      SaaS Validation
                    </h2>
                  </div>
                </div>

                {/* Idea Validation Card */}
                <div className="col-span-full sm:col-span-3 lg:col-span-2 overflow-hidden relative border border-border rounded-xl p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
                  <div>
                    <div className="relative aspect-square rounded-full size-32 flex border mx-auto dark:bg-white/5 dark:border-white/10 before:absolute before:-inset-2 before:border dark:before:border-white/5 dark:before:bg-white/5 before:rounded-full">
                      <Lightbulb className="w-16 h-16 m-auto text-orange-400" />
                    </div>
                    <div className="mt-6 text-center relative z-10 space-y-2">
                      <h2 className="text-lg font-medium transition group-hover:text-secondary-950 dark:text-white">
                        Idea Planning & Outlines
                      </h2>
                      <p className="text-muted-foreground">
                        Test your SaaS concept with real data and feedback
                        before investing significant resources in development.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Analytics Card */}
                <div className="col-span-full sm:col-span-3 lg:col-span-2 overflow-hidden relative border border-border rounded-xl p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
                  <div>
                    <div className="pt-6 lg:px-6">
                      <svg
                        className="w-full h-1/2"
                        viewBox="0 0 326 140"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M0.148438 231V179.394L1.92188 180.322L2.94482 177.73L4.05663 183.933L6.77197 178.991L7.42505 184.284L9.42944 187.985L11.1128 191.306V155.455L13.6438 153.03V145.122L14.2197 142.829V150.454V154.842L15.5923 160.829L17.0793 172.215H19.2031V158.182L20.7441 153.03L22.426 148.111V142.407L24.7471 146.86V128.414L26.7725 129.918V120.916L28.1492 118.521L28.4653 127.438L29.1801 123.822L31.0426 120.525V130.26L32.3559 134.71L34.406 145.122V137.548L35.8982 130.26L37.1871 126.049L38.6578 134.71L40.659 138.977V130.26V126.049L43.7557 130.26V123.822L45.972 112.407L47.3391 103.407V92.4726L49.2133 98.4651V106.053L52.5797 89.7556L54.4559 82.7747L56.1181 87.9656L58.9383 89.7556V98.4651L60.7617 103.407L62.0545 123.822L63.8789 118.066L65.631 122.082L68.5479 114.229L70.299 109.729L71.8899 118.066L73.5785 123.822V130.26L74.9446 134.861L76.9243 127.87L78.352 134.71V138.977L80.0787 142.407V152.613L83.0415 142.407V130.26L86.791 123.822L89.0121 116.645V122.082L90.6059 127.87L92.3541 131.77L93.7104 123.822L95.4635 118.066L96.7553 122.082V137.548L99.7094 140.988V131.77L101.711 120.525L103.036 116.645V133.348L104.893 136.218L106.951 140.988L108.933 134.71L110.797 130.26L112.856 140.988V148.111L115.711 152.613L117.941 145.122L119.999 140.988V148.111L123.4 152.613L125.401 158.182L130.547 150.454V156.566L131.578 155.455L134.143 158.182L135.594 168.136L138.329 158.182L140.612 160.829L144.681 169.5L147.011 155.455L148.478 151.787L151.02 152.613L154.886 145.122L158 143.412L159.406 140.637L159.496 133.348L162.295 127.87V122.082L163.855 116.645V109.729L164.83 104.407L166.894 109.729L176.249 98.4651L178.254 106.169L180.77 98.4651V81.045L182.906 69.1641L184.8 56.8669L186.477 62.8428L187.848 79.7483L188.849 106.169L191.351 79.7483L193.485 75.645V98.4651L196.622 94.4523L198.623 87.4228V79.7483L200.717 75.645L202.276 81.045V89.3966L203.638 113.023L205.334 99.8037L207.164 94.4523L208.982 98.4651V102.176L211.267 107.64L212.788 81.045L214.437 66.0083L216.19 62.8428L217.941 56.8669V73.676V79.7483L220.28 75.645L222.516 66.0083V73.676H226.174V84.8662L228.566 98.4651L230.316 75.645L233.61 94.4523V104.25L236.882 102.176L239.543 113.023L241.057 98.4651L243.604 94.4523L244.975 106.169L245.975 87.4228L247.272 89.3966L250.732 84.8662L251.733 96.7549L254.644 94.4523L257.452 99.8037L259.853 91.3111L261.193 84.8662L264.162 75.645L265.808 87.4228L267.247 58.4895L269.757 66.0083L276.625 13.5146L273.33 58.4895L276.25 67.6563L282.377 20.1968L281.37 58.4895V66.0083L283.579 75.645L286.033 56.8669L287.436 73.676L290.628 77.6636L292.414 84.8662L294.214 61.3904L296.215 18.9623L300.826 0.947876L297.531 56.8669L299.973 62.8428L305.548 22.0598L299.755 114.956L301.907 105.378L304.192 112.688V94.9932L308.009 80.0829L310.003 94.9932L311.004 102.127L312.386 105.378L315.007 112.688L316.853 98.004L318.895 105.378L321.257 94.9932L324.349 100.81L325.032 80.0829L327.604 61.5733L329.308 82.3223L333.525 52.7986L334.097 52.145L334.735 55.6812L337.369 59.8108V73.676L340.743 87.9656L343.843 96.3728L348.594 82.7747L349.607 81.045L351 89.7556L352.611 96.3728L355.149 94.9932L356.688 102.176L359.396 108.784L360.684 111.757L365 95.7607V231H148.478H0.148438Z"
                          fill="url(#paint0_linear_0_705)"
                        />
                        <path
                          className="text-primary dark:text-pink-500"
                          d="M1 179.796L4.05663 172.195V183.933L7.20122 174.398L8.45592 183.933L10.0546 186.948V155.455L12.6353 152.613V145.122L15.3021 134.71V149.804V155.455L16.6916 160.829L18.1222 172.195V158.182L19.8001 152.613L21.4105 148.111V137.548L23.6863 142.407V126.049L25.7658 127.87V120.525L27.2755 118.066L29.1801 112.407V123.822L31.0426 120.525V130.26L32.3559 134.71L34.406 145.122V137.548L35.8982 130.26L37.1871 126.049L38.6578 134.71L40.659 138.977V130.26V126.049L43.7557 130.26V123.822L45.972 112.407L47.3391 103.407V92.4726L49.2133 98.4651V106.053L52.5797 89.7556L54.4559 82.7747L56.1181 87.9656L58.9383 89.7556V98.4651L60.7617 103.407L62.0545 123.822L63.8789 118.066L65.631 122.082L68.5479 114.229L70.299 109.729L71.8899 118.066L73.5785 123.822V130.26L74.9446 134.861L76.9243 127.87L78.352 134.71V138.977L80.0787 142.407V152.613L83.0415 142.407V130.26L86.791 123.822L89.0121 116.645V122.082L90.6059 127.87L92.3541 131.77L93.7104 123.822L95.4635 118.066L96.7553 122.082V137.548L99.7094 140.988V131.77L101.711 120.525L103.036 116.645V133.348L104.893 136.218L106.951 140.988L108.933 134.71L110.797 130.26L112.856 140.988V148.111L115.711 152.613L117.941 145.122L119.999 140.988V148.111L123.4 152.613L125.401 158.182L130.547 150.454V156.566L131.578 155.455L134.143 158.182L135.594 168.136L138.329 158.182L140.612 160.829L144.681 169.5L147.011 155.455L148.478 151.787L151.02 152.613L154.886 145.122L158 143.412L159.406 140.637L159.496 133.348L162.295 127.87V122.082L163.855 116.645V109.729L164.83 104.407L166.894 109.729L176.249 98.4651L178.254 106.169L180.77 98.4651V81.045L182.906 69.1641L184.8 56.8669L186.477 62.8428L187.848 79.7483L188.849 106.169L191.351 79.7483L193.485 75.645V98.4651L196.622 94.4523L198.623 87.4228V79.7483L200.717 75.645L202.276 81.045V89.3966L203.638 113.023L205.334 99.8037L207.164 94.4523L208.982 98.4651V102.176L211.267 107.64L212.788 81.045L214.437 66.0083L216.19 62.8428L217.941 56.8669V73.676V79.7483L220.28 75.645L222.516 66.0083V73.676H226.174V84.8662L228.566 98.4651L230.316 75.645L233.61 94.4523V104.25L236.882 102.176L239.543 113.023L241.057 98.4651L243.604 94.4523L244.975 106.169L245.975 87.4228L247.272 89.3966L250.732 84.8662L251.733 96.7549L254.644 94.4523L257.452 99.8037L259.853 91.3111L261.193 84.8662L264.162 75.645L265.808 87.4228L267.247 58.4895L269.757 66.0083L276.625 13.5146L273.33 58.4895L276.25 67.6563L282.377 20.1968L281.37 58.4895V66.0083L283.579 75.645L286.033 56.8669L287.436 73.676L290.628 77.6636L292.414 84.8662L294.214 61.3904L296.215 18.9623L300.826 0.947876L297.531 56.8669L299.973 62.8428L305.548 22.0598L299.755 114.956L301.907 105.378L304.192 112.688V94.9932L308.009 80.0829L310.003 94.9932L311.004 102.127L312.386 105.378L315.007 112.688L316.853 98.004L318.895 105.378L321.257 94.9932L324.349 100.81L325.032 80.0829L327.604 61.5733L329.308 82.3223L333.525 52.7986L334.097 52.145L334.735 55.6812L337.369 59.8108V73.676L340.743 87.9656L343.843 96.3728L348.594 82.7747L349.607 81.045L351 89.7556L352.611 96.3728L355.149 94.9932L356.688 102.176L359.396 108.784L360.684 111.757L365 95.7607V231H148.478H0.148438Z"
                          stroke="currentColor"
                          strokeWidth="1"
                        />
                        <defs>
                          <linearGradient
                            id="paint0_linear_0_705"
                            x1="0.85108"
                            y1="0.947876"
                            x2="0.85108"
                            y2="115.057"
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop
                              className="text-red-500/20 dark:text-cyan-500/50"
                              stopColor="currentColor"
                            />
                            <stop
                              className="text-transparent"
                              offset="1"
                              stopColor="currentColor"
                              stopOpacity="0.01"
                            />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    <div className="mt-6 text-center relative z-10 space-y-2">
                      <h2 className="text-lg font-medium transition group-hover:text-secondary-950">
                        Market Information
                      </h2>
                      <p className="text-muted-foreground">
                        Track market trends, potential early adopters and a lot
                        more from one place.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Project Management Card */}
                <div className="col-span-full lg:col-span-3 overflow-hidden relative border border-border rounded-xl p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
                  <div className="grid sm:grid-cols-2">
                    <div className="flex flex-col justify-between relative z-10 space-y-12 lg:space-y-6">
                      <div className="relative aspect-square rounded-full size-12 flex border dark:bg-white/5 dark:border-white/10 before:absolute before:-inset-2 before:border dark:before:border-white/5 dark:before:bg-white/5 before:rounded-full">
                        <ListChecks className="size-6 m-auto text-primary" />
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-lg font-medium text-gray-800 transition group-hover:text-secondary-950 dark:text-white">
                          Project Management
                        </h2>
                        <p className="dark:text-gray-300 text-gray-700">
                          Organize tasks, track progress, and collaborate with
                          your team to build your SaaS product efficiently.
                        </p>
                      </div>
                    </div>
                    <div
                      data-rounded="large"
                      className="relative mt-6 sm:mt-auto h-fit -mb-[calc(var(--card-padding)+1px)] -mr-[calc(var(--card-padding)+1px)] sm:ml-6 py-6 p-6 card bg-muted/50 rounded-xl border border-border"
                    >
                      <div className="absolute flex gap-1 top-2 left-3">
                        <span className="block size-2 rounded-full border dark:border-white/10 dark:bg-white/10"></span>
                        <span className="block size-2 rounded-full border dark:border-white/10 dark:bg-white/10"></span>
                        <span className="block size-2 rounded-full border dark:border-white/10 dark:bg-white/10"></span>
                      </div>
                      <div className="w-full h-40 flex items-center justify-center">
                        <div className="w-full h-full bg-gradient-to-b from-primary/10 to-transparent rounded-lg flex items-center justify-center">
                          <div className="w-3/4 h-4 bg-primary/20 rounded-full mb-8"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Waitlist & Launch Card */}
                <div className="col-span-full lg:col-span-3 overflow-hidden relative border border-border rounded-xl p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
                  <div className="h-full grid sm:grid-cols-2">
                    <div className="flex flex-col justify-between relative z-10 space-y-12 lg:space-y-6">
                      <div className="relative aspect-square rounded-full size-12 flex border dark:bg-white/5 dark:border-white/10 before:absolute before:-inset-2 before:border dark:before:border-white/5 dark:before:bg-white/5 before:rounded-full">
                        <Rocket className="size-6 m-auto text-primary" />
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-lg font-medium transition">
                          Launch & Feedback
                        </h2>
                        <p className="text-muted-foreground">
                          Build trust with user feedback and launch your SaaS
                          product with maximum impact.
                        </p>
                      </div>
                    </div>
                    <div className="mt-6 relative sm:-mr-[--card-padding] sm:-my-[--card-padding] before:absolute before:w-px before:inset-0 before:mx-auto before:bg-border">
                      <div className="relative space-y-6 py-6 flex flex-col justify-center h-full">
                        <div className="flex items-center justify-end gap-2 w-[calc(50%+0.875rem)] relative">
                          <span className="h-fit text-xs block px-2 py-1 shadow-sm bg-background border border-border rounded-md">
                            Early Access
                          </span>
                          <div className="size-7 ring-4 ring-background">
                            <img
                              className="rounded-full size-full"
                              src="https://i.pravatar.cc/32?img=3"
                              alt="User avatar"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-[calc(50%-1rem)] relative">
                          <div className="size-8 ring-4 ring-background">
                            <img
                              className="rounded-full size-full"
                              src="https://i.pravatar.cc/32?img=5"
                              alt="User avatar"
                            />
                          </div>
                          <span className="h-fit text-xs block px-2 py-1 shadow-sm bg-background border border-border rounded-md">
                            Waitlisted
                          </span>
                        </div>
                        <div className="flex items-center justify-end gap-2 w-[calc(50%+0.875rem)] relative">
                          <span className="h-fit text-xs block px-2 py-1 shadow-sm bg-background border border-border rounded-md">
                            Beta Tester
                          </span>
                          <div className="size-7 ring-4 ring-background">
                            <img
                              className="rounded-full size-full"
                              src="https://i.pravatar.cc/32?img=8"
                              alt="User avatar"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
